from django.contrib import admin
from .models import FinalQuizProgress, Module, UserProgress, Question, ModulePage, ModuleTitle

# Register UserProgress normally
admin.site.register(UserProgress)

# Inline for pages and questions
class ModulePageInline(admin.TabularInline):
    model = ModulePage
    extra = 1

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

# Admin for ModuleTitle
@admin.register(ModuleTitle)
class ModuleTitleAdmin(admin.ModelAdmin):
    list_display = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}

# Admin for position-specific Module
@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("get_title", "position", "order")
    inlines = [ModulePageInline, QuestionInline]

    # Use a callable to display the title from ModuleTitle
    def get_title(self, obj):
        return obj.title_ref.title
    get_title.short_description = "Module Title"

@admin.register(FinalQuizProgress)
class FinalQuizProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "completed", "score", "timestamp")
    list_filter = ("completed", "timestamp")
    search_fields = ("user__username", "user__first_name", "user__last_name")
    ordering = ("-timestamp",)
