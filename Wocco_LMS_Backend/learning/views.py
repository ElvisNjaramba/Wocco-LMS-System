from sys import modules
from django.http import HttpResponse
import openpyxl
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from .utils import is_final_quiz_unlocked, is_module_unlocked
from authentication.models import CreatedUserCredential
from .models import FinalQuizProgress, Module, ModulePage, ModuleTitle, PageProgress, Question, QuizAttempt, QuizAttempt, UserProgress
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

        # ✅ ADD THIS BLOCK:
    from django.utils import timezone
    from datetime import timedelta
    COOLDOWN_MINUTES = 30
    MAX_ATTEMPTS = 3
    recent_attempts = QuizAttempt.objects.filter(
        user=user, module=module,
        attempted_at__gte=timezone.now() - timedelta(minutes=COOLDOWN_MINUTES)
    )
    if recent_attempts.count() >= MAX_ATTEMPTS:
        return Response({"detail": "Too many attempts. Please wait 30 minutes."}, status=429)

    answers = request.data.get("answers", {})
    questions = module.questions.all()[:10]

    score = 0
    detailed_results = []

    for q in questions:
        selected = answers.get(str(q.id))
        is_correct = selected == q.correct_option

        if is_correct:
            score += 1

        detailed_results.append({
            "question_id": q.id,
            "question": q.text,
            "selected": selected,
            "correct": q.correct_option,
            "is_correct": is_correct,
            "options": {
                "A": q.option_a,
                "B": q.option_b,
                "C": q.option_c,
                "D": q.option_d,
            }
        })

    progress, _ = UserProgress.objects.get_or_create(
        user=user,
        module=module
    )

    progress.score = score
    progress.completed = score >= 8
    progress.save()
    QuizAttempt.objects.create(user=user, module=module, score=score)

    next_module = None
    if score >= 8:
        position = user.profile.title.name
        next_module = (
            Module.objects
            .filter(position=position, order__gt=module.order)
            .order_by("order")
            .first()
        )

    return Response({
        "passed": score >= 8,
        "score": score,
        "results": detailed_results,
        "next": {
            "id": next_module.id,
            "title": next_module.title_ref.title
        } if next_module else None
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

        reading_time = 0
        if module:
            total_words = sum(
                len((p.content or '').split())
                for p in module.pages.all()
            )
            reading_time = max(1, round(total_words / 200))

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
            "module_id": module.id if module else None,
            "reading_time": reading_time,
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
            progress, _ = UserProgress.objects.get_or_create(user=user, module=module)
            attempts = list(
                QuizAttempt.objects.filter(user=user, module=module)
                .order_by("attempted_at")
                .values("score", "attempted_at")
            )
            modules.append({
                "module_id": module.id,
                "module_title": module.title_ref.title,
                "completed": progress.completed,
                "score": progress.score,          # best/latest score
                "attempts": attempts,             # ← full history
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
            "is_active": user.is_active,
            "modules": modules,
            "final_quiz": {
                "completed": final_quiz.completed if final_quiz else False,
                "score": final_quiz.score if final_quiz else 0
            }
        })

    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_page_progress(request, module_id):
    page_id = request.data.get('page_id')
    page = get_object_or_404(ModulePage, id=page_id)
    PageProgress.objects.update_or_create(
        user=request.user, page=page,
        defaults={'completed': True}
    )
    return Response({"saved": True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_last_page(request, module_id):
    completed_pages = PageProgress.objects.filter(
        user=request.user,
        page__module_id=module_id,
        completed=True
    ).values_list('page__order', flat=True)
    last_order = max(completed_pages, default=0)
    return Response({"last_page_order": last_order})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_detail_progress_api(request, user_id):
    user = get_object_or_404(User, id=user_id)
    profile = getattr(user, 'profile', None)
    position = profile.title.name if profile and profile.title else None
    modules = Module.objects.filter(position=position).order_by('order') if position else []
    data = []
    for module in modules:
        progress = UserProgress.objects.filter(user=user, module=module).first()
        attempts = QuizAttempt.objects.filter(user=user, module=module).values('score', 'attempted_at')
        data.append({
            "module_title": module.title_ref.title,
            "completed": progress.completed if progress else False,
            "score": progress.score if progress else 0,
            "attempts": list(attempts)
        })
    return Response({
    "user": f"{user.first_name} {user.last_name}",
    "position": position or "N/A",
    "department": profile.department.name if profile and profile.department else "N/A",
    "modules": data,
    "final_quiz": {
        "completed": final_quiz.completed if final_quiz else False,
        "score": final_quiz.score if final_quiz else 0
    } if (final_quiz := FinalQuizProgress.objects.filter(user=user).first()) else {
        "completed": False, "score": 0
    }
})




@api_view(['GET'])
@permission_classes([IsAdminUser])
def department_analytics_api(request):
    from django.db.models import Avg, Count
    users = User.objects.select_related('profile__department').all()
    dept_map = {}
    for user in users:
        profile = getattr(user, 'profile', None)
        if not profile or not profile.department:
            continue
        dept = profile.department.name
        if dept not in dept_map:
            dept_map[dept] = {"total": 0, "completed_final": 0, "avg_score": []}
        dept_map[dept]["total"] += 1
        fq = FinalQuizProgress.objects.filter(user=user).first()
        if fq and fq.completed:
            dept_map[dept]["completed_final"] += 1
        scores = UserProgress.objects.filter(user=user).values_list('score', flat=True)
        dept_map[dept]["avg_score"].extend(scores)

    result = [
        {
            "department": dept,
            "total_users": v["total"],
            "final_quiz_passed": v["completed_final"],
            "avg_module_score": round(sum(v["avg_score"]) / len(v["avg_score"]), 1) if v["avg_score"] else 0
        }
        for dept, v in dept_map.items()
    ]
    return Response(result)



@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_users_excel(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "User Progress"

    users = User.objects.select_related('profile').order_by('-date_joined')
    # Build header dynamically
    all_module_titles = list(
        Module.objects.values_list('title_ref__title', flat=True).distinct()
    )
    ws.append(["Name", "Username", "Position", "Department"] + all_module_titles + ["Final Quiz Score"])

    for user in users:
        profile = getattr(user, 'profile', None)
        if not profile or not profile.title:
            continue
        position = profile.title.name
        row = [
            f"{user.first_name} {user.last_name}",
            user.username,
            position,
            profile.department.name if profile.department else "N/A"
        ]
        for title in all_module_titles:
            module = Module.objects.filter(title_ref__title=title, position=position).first()
            if module:
                progress = UserProgress.objects.filter(user=user, module=module).first()
                row.append(progress.score if progress else 0)
            else:
                row.append("N/A")
        fq = FinalQuizProgress.objects.filter(user=user).first()
        row.append(fq.score if fq else 0)
        ws.append(row)

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="user_progress.xlsx"'
    wb.save(response)
    return response



from .models import ModuleTitle, Module, ModulePage

@api_view(['GET'])
@permission_classes([IsAdminUser])
def editor_modules_api(request):
    """List all ModuleTitles with their position-specific modules and pages."""
    titles = ModuleTitle.objects.prefetch_related(
        'position_modules__pages'
    ).all().order_by('id')

    result = []
    for title in titles:
        for module in title.position_modules.all():
            result.append({
                "module_id": module.id,
                "title": title.title,
                "title_id": title.id,
                "position": module.position,
                "description": module.description,
                "order": module.order,
                "pages": [
                    {"id": p.id, "title": p.title, "content": p.content, "order": p.order}
                    for p in module.pages.all()
                ]
            })
    return Response(result)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def editor_update_page_api(request, page_id):
    """Update a single page's title and content."""
    page = get_object_or_404(ModulePage, id=page_id)
    page.title = request.data.get('title', page.title)
    page.content = request.data.get('content', page.content)
    page.save()
    return Response({"saved": True})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def editor_add_page_api(request, module_id):
    """Add a new page to a module."""
    module = get_object_or_404(Module, id=module_id)
    page = ModulePage.objects.create(
        module=module,
        title=request.data.get('title', 'New Page'),
        content=request.data.get('content', '')
    )
    return Response({"id": page.id, "title": page.title, "order": page.order}, status=201)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def editor_delete_page_api(request, page_id):
    page = get_object_or_404(ModulePage, id=page_id)
    page.delete()
    return Response(status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attempt_history_api(request):
    attempts = (
        QuizAttempt.objects
        .filter(user=request.user)
        .select_related('module__title_ref')
        .order_by('-attempted_at')
    )
    data = [
        {
            "module_title": a.module.title_ref.title,
            "score": a.score,
            "attempted_at": a.attempted_at,
            "passed": a.score >= 8,
        }
        for a in attempts
    ]
    return Response(data)