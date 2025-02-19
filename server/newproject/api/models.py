from django.db import models


class Todo(models.Model):
    # What type of todo this todo is.
    TYPE_TODO = "TODO"
    TYPE_CLASS = "CLASS"
    TYPE_EVENT = "EVENT"

    TODO_TYPE_CHOICES = [
        (TYPE_TODO, "TODO"),
        (TYPE_CLASS, "CLASS"),
        (TYPE_EVENT, "EVENT"),
    ]

    todo_type = models.CharField(
        null=False,
        blank=False,
        max_length=5,
        choices=TODO_TYPE_CHOICES,
        default=TYPE_TODO,
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # If null, don't notify!
    notify_time = models.DateTimeField(null=True, blank=True)
    delivered = models.BooleanField(default=False)

    # The type of repeating this Todo does, if any.
    REPEAT_NEVER = "N"
    REPEAT_WEEKS = "W"
    REPEAT_MONTHS = "M"
    REPEAT_YEARS = "Y"

    REPEAT_TYPE_CHOICES = [
        (REPEAT_NEVER, "Don't repeat"),
        (REPEAT_WEEKS, "Every X weeks"),
        (REPEAT_MONTHS, "Every X months"),
        (REPEAT_YEARS, "Every X years"),
    ]

    repeat_type = models.CharField(
        max_length=1,
        choices=REPEAT_TYPE_CHOICES,
        default=REPEAT_NEVER,
    )

    # The "X" in "Repeat every X weeks", "Repeat every X months", etc.
    repeat_frequency = models.PositiveSmallIntegerField(default=1)

    # `repeat_days` is a bitflag. If a bit is set to 0, do not repeat on that day.
    # If it is set to 1, repeat on that day. You can toggle a day by taking the
    # XOR of the current value and the appropriate constants as listed below.
    # REPEAT_DAYS_SUN = 0b1000000
    # REPEAT_DAYS_MON = 0b0100000
    # REPEAT_DAYS_TUE = 0b0010000
    # REPEAT_DAYS_WED = 0b0001000
    # REPEAT_DAYS_THU = 0b0000100
    # REPEAT_DAYS_FRI = 0b0000010
    # REPEAT_DAYS_SAT = 0b0000001
    repeat_days = models.PositiveSmallIntegerField(default=0b0000000)

    # Repeat date interval.
    repeat_start_time = models.DateTimeField(null=True, blank=True)
    repeat_end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


class TimeEntry(models.Model):
    todo = models.ForeignKey(Todo, on_delete=models.CASCADE)
    week_start_date = models.DateField()
    minutes_spent = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.todo.title} - {self.week_start_date} ({self.minutes_spent} minutes)"
        )
