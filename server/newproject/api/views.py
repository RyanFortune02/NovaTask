from datetime import timedelta
from django.utils import timezone
from django.db.models import QuerySet
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Todo, TimeEntry
from .serializer import TodoSerializer, TimeEntrySerializer


# Api view decorator @api_view defines the allowed HTTP methods
@api_view(["GET", "POST"])
def todos(request):
    if request.method == "GET":
        # GET request is for retrieving data
        todos = Todo.objects.all()  # Get all todos from database
        serializer = TodoSerializer(todos, many=True)  # Convert todos to JSON format
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        # POST request is for creating data
        serializer = TodoSerializer(data=request.data)  # Convert JSON to Todo format
        if serializer.is_valid():
            serializer.save()  # Save the data to database if valid
            return Response(
                serializer.data, status=status.HTTP_201_CREATED
            )  # Return 201 status for successful creation
        return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )  # Return errors if data is invalid


@api_view(["GET", "PUT", "DELETE"])
def todo_detail(request, pk):
    """
    Function handles individual todo operations:
    GET: Retrieve a specific todo
    PUT: Update a specific todo
    DELETE: Remove a specific todo
    """
    try:
        todo = Todo.objects.get(
            id=pk
        )  # Attempt to retrieve the todo by its primary key
    except Todo.DoesNotExist:
        return Response(
            {"error": "Todo not found"}, status=status.HTTP_404_NOT_FOUND
        )  # Return 404 if todo doesn't exist

    if request.method == "GET":
        serializer = TodoSerializer(todo)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PUT":
        serializer = TodoSerializer(
            todo, data=request.data
        )  # Combine existing todo with updated data
        if serializer.is_valid():
            serializer.save()  # Save the updated data if validation is successful
            return Response(
                serializer.data, status=status.HTTP_200_OK
            )  # Return the updated todo data
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        todo.delete()  # Remove the todo from the database
        return Response(
            status=status.HTTP_204_NO_CONTENT
        )  # Return 204 status to indicate successful deletion


@api_view(["GET"])
def check_notifications(request):
    if request.method != "GET":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # Check for notifications due within next minute
    poll_max_time = timezone.now() + timedelta(minutes=1)

    pending_notifications = Todo.objects.filter(
        delivered=False,
        notify_time__lte=poll_max_time,
    )

    serializer = TodoSerializer(
        pending_notifications, many=True
    )  # Convert todos to JSON format

    for todo in pending_notifications:
        # Send notification logic here
        todo.delivered = True
        todo.save()

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def time_entries(request):
    if request.method == "GET":
        # Retrieve all time entries
        time_entries = TimeEntry.objects.all()
        serializer = TimeEntrySerializer(time_entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        # Creating time entries
        serializer = TimeEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Something not allowed.
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(["GET", "DELETE"])
def time_entry_by_foreign(request, fpk):
    try:
        try:
            fk = Todo.objects.get(id=fpk)
        except:
            return Response(
                {"error": f'Todo not found for primary key: "{fpk}"'},
                status=status.HTTP_404_NOT_FOUND,
            )
        # There could be more than one! Beware!
        time_entries = TimeEntry.objects.filter(todo=fk)
    except TimeEntry.DoesNotExist:
        return Response(
            {"error": f'TimeEntry not found for foriegn key: "{fk}"'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        # Retrieve
        serializer = TimeEntrySerializer(time_entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        # Delete
        try:
            for time_entry in time_entries:
                time_entry.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except:
            message = "The server refuses to brew coffee because it is, permanently, a teapot."
            return Response({"error": message}, status=status.HTTP_418_IM_A_TEAPOT)

    else:
        # Something not allowed.
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(["GET", "PUT", "DELETE"])
def time_entry_detail(request, pk):
    try:
        time_entry = TimeEntry.objects.get(id=pk)
    except TimeEntry.DoesNotExist:
        return Response(
            {"error": f'TimeEntry not found for primary key: "{pk}"'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        # Retrieve
        serializer = TimeEntrySerializer(time_entry)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PUT":
        # Update
        serializer = TimeEntrySerializer(time_entry, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        # Delete
        try:
            time_entry.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except:
            message = "The server refuses to brew coffee because it is, permanently, a teapot."
            return Response({"error": message}, status=status.HTTP_418_IM_A_TEAPOT)

    else:
        # Something not allowed.
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
