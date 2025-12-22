# authentication/admin.py
from django.contrib import admin
from django.contrib.auth.models import User
from .models import Profile, Position, Department

admin.site.register(Position)
admin.site.register(Department)
# Optional: inline profile editing
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'

# Extend User admin to show Profile inline
class UserAdmin(admin.ModelAdmin):
    inlines = (ProfileInline,)

# Unregister default User admin and register new
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Register Profile separately if needed
admin.site.register(Profile)
