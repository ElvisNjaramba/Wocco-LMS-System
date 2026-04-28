import profile
from django.shortcuts import get_object_or_404
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import User

from LMS_System import settings
from django.conf import settings
from .models import Department, Position, Profile, UserSession
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

from rest_framework_simplejwt.views import TokenObtainPairView
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            ip = request.META.get('REMOTE_ADDR')
            ua = request.META.get('HTTP_USER_AGENT', '')
            user = User.objects.get(username=request.data['username'])
            UserSession.objects.create(user=user, ip_address=ip, user_agent=ua)
        return response

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
    profile.must_change_password = True

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
                department=dept_obj,
                must_change_password=True
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
        "position": profile.title.name if profile.title else None,      # ✅ .name
        "department": profile.department.name if profile.department else None,  # ✅ .name
        "must_change_password": profile.must_change_password,
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

from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        send_mail("Password Reset", f"Click here: {reset_link}", settings.DEFAULT_FROM_EMAIL, [email])
    return Response({"message": "If this email exists, a reset link was sent."})

@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    password = request.data.get('password')
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except Exception:
        return Response({"error": "Invalid link"}, status=400)
    if not default_token_generator.check_token(user, token):
        return Response({"error": "Token expired or invalid"}, status=400)
    user.set_password(password)
    user.save()
    return Response({"message": "Password reset successful"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    new_password = request.data.get('new_password')
    user.set_password(new_password)
    user.save()
    user.profile.must_change_password = False
    user.profile.save()
    return Response({"message": "Password updated"})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_user_active(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.is_active = not user.is_active
    user.save()
    return Response({"is_active": user.is_active})