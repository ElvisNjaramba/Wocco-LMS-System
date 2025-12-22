from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ModuleViewSet,
    all_users_progress_api,
    dashboard_api,
    module_pages_api,
    module_questions_api,
    complete_module_api,
    final_quiz_api,
    next_module_api,
    submit_final_quiz
)

learning_router = DefaultRouter()
learning_router.register(r'modules', ModuleViewSet, basename='modules')

urlpatterns = [
    *learning_router.urls,

    path('modules/<int:pk>/questions/', module_questions_api),
    path('modules/<int:pk>/complete/', complete_module_api),
    path('final-quiz/', final_quiz_api),
    path('submit-final-quiz/', submit_final_quiz, name='submit-final-quiz'),
    path("dashboard/modules/", dashboard_api, name="dashboard-modules"),
    path("modules/<int:module_id>/pages/", module_pages_api),
    path("modules/<int:module_id>/next/", next_module_api),
    path("superuser/all-users-progress/", all_users_progress_api, name="all_users_progress"),

]
