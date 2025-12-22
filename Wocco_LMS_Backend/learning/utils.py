from .models import Module, UserProgress

def is_module_unlocked(user, module):
    position = module.position

    first_module = Module.objects.filter(
        position=position
    ).order_by("order").first()

    if module == first_module:
        return True

    prev_module = Module.objects.filter(
        position=position,
        order__lt=module.order
    ).order_by("-order").first()

    if not prev_module:
        return False

    return UserProgress.objects.filter(
        user=user,
        module=prev_module,
        completed=True,
        score__gte=8
    ).exists()

def is_final_quiz_unlocked(user):
    position = user.profile.title.name
    modules = Module.objects.filter(position=position)
    
    # All modules must be completed with score >=8
    incomplete = UserProgress.objects.filter(
        user=user,
        module__in=modules,
        completed=False
    ).exists()
    
    return not incomplete
