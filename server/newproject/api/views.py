from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Todo
from .serializer import TodoSerializer

# Api view decorator @api_view defines the allowed HTTP methods
@api_view(['GET', 'POST'])
def todos(request):
    if request.method == 'GET':
        # GET request is for retrieving data
        todos = Todo.objects.all()  # Get all todos from database
        serializer = TodoSerializer(todos, many=True)  # Convert todos to JSON format
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # POST request is for creating data
        serializer = TodoSerializer(data=request.data)  # Convert JSON to Todo format
        if serializer.is_valid():
            serializer.save()  # Save the data to database if valid
            return Response(serializer.data, status=status.HTTP_201_CREATED)  # Return 201 status for successful creation
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # Return errors if data is invalid

@api_view(['GET', 'PUT', 'DELETE'])
def todo_detail(request, pk):
    """
    Function handles individual todo operations:
    GET: Retrieve a specific todo
    PUT: Update a specific todo
    DELETE: Remove a specific todo
    """
    try:
        todo = Todo.objects.get(id=pk)  # Attempt to retrieve the todo by its primary key
    except Todo.DoesNotExist:
        return Response({'error': 'Todo not found'}, status=status.HTTP_404_NOT_FOUND)  # Return 404 if todo doesn't exist

    if request.method == 'GET':
        serializer = TodoSerializer(todo)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = TodoSerializer(todo, data=request.data)  # Combine existing todo with updated data
        if serializer.is_valid():
            serializer.save()  # Save the updated data if validation is successful
            return Response(serializer.data)  # Return the updated todo data
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        todo.delete()  # Remove the todo from the database
        return Response(status=status.HTTP_204_NO_CONTENT)  # Return 204 status to indicate successful deletion
