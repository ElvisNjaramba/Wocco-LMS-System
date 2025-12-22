from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import User
from .models import Department, Position, Profile
from .serializers import ProfileSerializer, UserSerializer
from rest_framework import generics
from .serializers import RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
import secrets

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ProfileViewSet(ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

    # Allows PATCH to work
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# authentication/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
import openpyxl
from io import TextIOWrapper
from django.contrib.auth.models import User
from .models import Profile

from .models import CreatedUserCredential

@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_user_api(request):
    data = request.data

    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    position = data.get("position", "").strip()
    department = data.get("department", "").strip()

    if not first_name or not last_name or not position:
        return Response({"error": "first_name, last_name and position are required"}, status=400)

    username = generate_username(first_name, last_name)
    password = generate_password()

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    # Lookup position & department
    title_obj = Position.objects.filter(name=position).first()
    dept_obj = Department.objects.filter(name=department).first()

    profile, _ = Profile.objects.get_or_create(user=user)
    profile.title = title_obj
    profile.department = dept_obj
    profile.save()

    # Store temp credentials
    CreatedUserCredential.objects.create(
        user=user,
        username=username,
        temp_password=password,
        created_by=request.user
    )

    return Response({
        "detail": "User created successfully",
        "username": username,
        "password": password
    }, status=201)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_users_excel_api(request):
    excel_file = request.FILES.get("file")

    if not excel_file:
        return Response(
            {"error": "No file uploaded"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        wb = openpyxl.load_workbook(excel_file)
        sheet = wb.active

        # Normalize headers (case-insensitive)
        raw_headers = [cell.value for cell in sheet[1]]
        headers = [str(h).strip().lower() for h in raw_headers]

        REQUIRED_HEADERS = {"first_name", "last_name", "position", "department"}
        missing = REQUIRED_HEADERS - set(headers)

        if missing:
            return Response(
                {"error": f"Missing required columns: {list(missing)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_users = []
        skipped_users = []

        for row in sheet.iter_rows(min_row=2, values_only=True):
            row_data = dict(zip(headers, row))

            first_name = str(row_data.get("first_name", "")).strip()
            last_name = str(row_data.get("last_name", "")).strip()
            position = str(row_data.get("position", "")).strip()
            department = str(row_data.get("department", "")).strip()

            if not first_name or not last_name or not position:
                continue

            username = generate_username(first_name, last_name)
            password = generate_password()

            if User.objects.filter(username=username).exists():
                skipped_users.append(username)
                continue

            # ✅ Create user
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # ✅ Create or fetch Position & Department
            title_obj, _ = Position.objects.get_or_create(name=position)
            dept_obj, _ = Department.objects.get_or_create(name=department)

            # ✅ Update profile with instances
            Profile.objects.filter(user=user).update(
                title=title_obj,
                department=dept_obj
            )

            # ✅ Store credentials
            CreatedUserCredential.objects.create(
                user=user,
                username=username,
                temp_password=password,
                created_by=request.user
            )

            created_users.append({
                "username": username,
                "password": password
            })

        return Response(
            {
                "detail": "Upload completed",
                "created_users": created_users,
                "skipped_existing_users": skipped_users
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_api(request):
    profile = request.user.profile
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "is_superuser": request.user.is_superuser,
        "position": profile.title,
        "department": profile.department,
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def profile_choices_api(request):
    return Response({
        "positions": list(Position.objects.values_list("name", flat=True)),
        "departments": list(Department.objects.values_list("name", flat=True)),
    })

import random
import string
# -----------------------------
# Helper functions
# -----------------------------
def generate_username(first_name, last_name):
    base = f"{first_name}.{last_name}".lower().replace(" ", "")
    suffix = User.objects.filter(username__startswith=base).count() + 1
    return f"{base}{suffix}"

def generate_password(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


# -----------------------------
# Get all users created by the admin
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def created_users_api(request):
    records = CreatedUserCredential.objects.filter(
        created_by=request.user
    ).order_by("-created_at")

    data = [
        {
            "username": r.username,
            "password": r.temp_password,
            "created_at": r.created_at,
            "first_name": r.user.first_name,
            "last_name": r.user.last_name,
            "position": r.user.profile.title.name if r.user.profile.title else "N/A",
            "department": r.user.profile.department.name if r.user.profile.department else "N/A",
        }
        for r in records
    ]

    return Response(data)