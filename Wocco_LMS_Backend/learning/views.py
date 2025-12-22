from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from .utils import is_final_quiz_unlocked, is_module_unlocked
from authentication.models import CreatedUserCredential
from .models import FinalQuizProgress, Module, ModuleTitle, Question, UserProgress
from .serializers import ModulePageSerializer, ModuleSerializer, QuestionSerializer


class ModuleViewSet(ModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        position = self.request.user.profile.title.name
        queryset = Module.objects.filter(position=position).order_by('order')

        # 🔥 Ensure progress rows exist
        for module in queryset:
            UserProgress.objects.get_or_create(
                user=self.request.user,
                module=module
            )

        return queryset

    def get_serializer_context(self):
        return {'request': self.request}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def module_questions_api(request, pk):
    module = get_object_or_404(Module, pk=pk)

    if not is_module_unlocked(request.user, module):
        return Response(
            {"detail": "Module locked"},
            status=403
        )

    questions = Question.objects.filter(module=module).order_by('?')[:10]
    return Response(
        QuestionSerializer(questions, many=True).data
    )




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_module_api(request, pk):
    module = get_object_or_404(Module, pk=pk)
    user = request.user

    answers = request.data.get("answers", {})
    questions = module.questions.all()[:10]

    score = 0
    for q in questions:
        if str(answers.get(str(q.id))) == q.correct_option:
            score += 1

    progress, _ = UserProgress.objects.get_or_create(
        user=user,
        module=module
    )

    progress.score = score
    progress.completed = score >= 8
    progress.save()

    if score >= 8:
        position = user.profile.title.name
        next_module = (
            Module.objects
            .filter(position=position, order__gt=module.order)
            .order_by("order")
            .first()
        )

        return Response({
            "passed": True,
            "score": score,
            "next": {
                "id": next_module.id,
                "title": next_module.title_ref.title
            } if next_module else None
        })

    return Response({
        "passed": False,
        "score": score,
        "message": "Minimum pass mark is 8/10"
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def final_quiz_api(request):
    user = request.user

    if not is_final_quiz_unlocked(user):
        return Response(
            {"detail": "Complete all modules first."},
            status=403
        )

    position = user.profile.title.name

    # Pull 25 random questions across all modules for this position
    questions = Question.objects.filter(module__position=position).order_by('?')[:25]

    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_final_quiz(request):
    user = request.user
    answers = request.data.get("answers", {})
    question_ids = request.data.get("question_ids", [])

    if not is_final_quiz_unlocked(user):
        return Response({"detail": "Final quiz locked."}, status=403)

    questions = Question.objects.filter(id__in=question_ids)

    score = 0
    for q in questions:
        selected = answers.get(str(q.id))  # "option_a"

        if selected:
            selected_letter = selected.split("_")[-1].upper()  # "A"
            if selected_letter == q.correct_option:
                score += 1

    progress, _ = FinalQuizProgress.objects.get_or_create(user=user)
    progress.score = score
    progress.completed = score >= 20
    progress.save()

    return Response({
        "score": score,
        "passed": score >= 20,
        "message": "Final quiz completed!"
    })

from rest_framework.permissions import AllowAny

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def dashboard_api(request):
#     user = request.user if request.user.is_authenticated else None
#     position = getattr(user.profile.title, 'name', None) if user else None

#     titles = ModuleTitle.objects.all().order_by("id")
#     result = []

#     for title in titles:
#         module = Module.objects.filter(
#             title_ref=title,
#             position=position
#         ).first() if position else None

#         if module:
#             completed = False
#             unlocked = False
#             if user:
#                 progress, _ = UserProgress.objects.get_or_create(user=user, module=module)
#                 completed = progress.completed
#                 unlocked = is_module_unlocked(user, module)
#         else:
#             completed = False
#             unlocked = False

#         result.append({
#             "title_id": title.id,
#             "title": title.title,
#             "has_content": bool(module),
#             "completed": completed,
#             "unlocked": unlocked if user else False,  # anonymous users cannot unlock
#             "module_id": module.id if module else None
#         })

#     return Response(result)

from rest_framework.permissions import AllowAny
from .models import FinalQuizProgress

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_api(request):
    user = request.user if request.user.is_authenticated else None
    position = user.profile.title.name if user else None

    titles = ModuleTitle.objects.all().order_by("id")
    result = []

    for title in titles:
        module = (
            Module.objects.filter(
                title_ref=title,
                position=position
            ).first()
            if position else None
        )

        if user and module:
            progress, _ = UserProgress.objects.get_or_create(
                user=user,
                module=module
            )
            completed = progress.completed
            unlocked = is_module_unlocked(user, module)
        else:
            completed = False
            unlocked = False

        result.append({
            "title_id": title.id,
            "title": title.title,
            "has_content": bool(module),
            "completed": completed,
            "unlocked": unlocked if user else False,
            "module_id": module.id if module else None
        })

    final_progress = (
        FinalQuizProgress.objects.filter(user=user).first()
        if user else None
    )

    return Response({
        "modules": result,
        "authenticated": bool(user),
        "final_quiz": {
            "completed": final_progress.completed if final_progress else False,
            "score": final_progress.score if final_progress else 0
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def module_pages_api(request, module_id):
    module = get_object_or_404(Module, id=module_id)

    if not is_module_unlocked(request.user, module):
        return Response(
            {"detail": "Module locked. Complete previous module first."},
            status=403
        )

    pages = module.pages.all()
    page_serializer = ModulePageSerializer(pages, many=True)
    return Response(page_serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def next_module_api(request, module_id):
    current = get_object_or_404(Module, id=module_id)
    position = request.user.profile.title

    next_module = (
        Module.objects
        .filter(position=position, order__gt=current.order)
        .order_by("order")
        .first()
    )

    if not next_module:
        return Response({"next": None})

    return Response({
        "next": {
            "id": next_module.id,
            "title": next_module.title
        }
    })
from django.contrib.auth.models import User


# @api_view(['GET'])
# @permission_classes([IsAdminUser])
# def all_users_progress_api(request):
#     users = User.objects.all().select_related('profile')
#     result = []

#     for user in users:
#         profile = getattr(user, "profile", None)
#         if not profile or not profile.title:
#             continue

#         position = profile.title.name
#         modules = []

#         # Module progress
#         position_modules = Module.objects.filter(position=position).order_by('order')
#         for module in position_modules:
#             progress, _ = UserProgress.objects.get_or_create(
#                 user=user,
#                 module=module
#             )
#             modules.append({
#                 "module_id": module.id,
#                 "module_title": module.title_ref.title,
#                 "completed": progress.completed,
#                 "score": progress.score
#             })

#         # Final Quiz progress
#         final_quiz = FinalQuizProgress.objects.filter(user=user).first()

#         # User credentials
#         cred = CreatedUserCredential.objects.filter(user=user).first()

#         result.append({
#             "id": user.id,
#             "first_name": user.first_name,
#             "last_name": user.last_name,
#             "username": cred.username if cred else user.username,
#             "password": cred.temp_password if cred else "N/A",
#             "position": profile.title.name,
#             "department": profile.department.name if profile.department else "N/A",
#             "modules": modules,
#             "final_quiz": {
#                 "completed": final_quiz.completed if final_quiz else False,
#                 "score": final_quiz.score if final_quiz else 0
#             }
#         })

#     return Response(result)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_users_progress_api(request):
    # Order users by most recent first
    users = User.objects.all().select_related('profile').order_by('-date_joined')
    result = []

    for user in users:
        profile = getattr(user, "profile", None)
        if not profile or not profile.title:
            continue

        position = profile.title.name
        modules = []

        # Module progress
        position_modules = Module.objects.filter(position=position).order_by('order')
        for module in position_modules:
            progress, _ = UserProgress.objects.get_or_create(
                user=user,
                module=module
            )
            modules.append({
                "module_id": module.id,
                "module_title": module.title_ref.title,
                "completed": progress.completed,
                "score": progress.score
            })

        # Final Quiz progress
        final_quiz = FinalQuizProgress.objects.filter(user=user).first()

        # User credentials
        cred = CreatedUserCredential.objects.filter(user=user).first()

        result.append({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": cred.username if cred else user.username,
            "password": cred.temp_password if cred else "N/A",
            "position": profile.title.name,
            "department": profile.department.name if profile.department else "N/A",
            "modules": modules,
            "final_quiz": {
                "completed": final_quiz.completed if final_quiz else False,
                "score": final_quiz.score if final_quiz else 0
            }
        })

    return Response(result)
