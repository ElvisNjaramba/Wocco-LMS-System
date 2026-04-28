from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ModuleViewSet,
    all_users_progress_api,
    dashboard_api,
    department_analytics_api,
    editor_add_page_api,
    editor_delete_page_api,
    editor_modules_api,
    editor_update_page_api,
    export_users_excel,
    get_last_page,
    module_pages_api,
    module_questions_api,
    complete_module_api,
    final_quiz_api,
    my_attempt_history_api,
    next_module_api,
    save_page_progress,
    submit_final_quiz,
    user_detail_progress_api
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

    path("modules/<int:module_id>/save-page/", save_page_progress),
    path("modules/<int:module_id>/last-page/", get_last_page),

    path("superuser/user-progress/<int:user_id>/", user_detail_progress_api),
    path("superuser/department-analytics/", department_analytics_api),
    path("superuser/export-excel/", export_users_excel),
    path("my-attempts/", my_attempt_history_api),

    path("superuser/editor/modules/", editor_modules_api),
    path("superuser/editor/pages/<int:page_id>/", editor_update_page_api),
    path("superuser/editor/modules/<int:module_id>/add-page/", editor_add_page_api),
    path("superuser/editor/pages/<int:page_id>/delete/", editor_delete_page_api),
]
