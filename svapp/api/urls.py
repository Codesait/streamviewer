from django.urls import path, include

urlpatterns = [
    path('streams/', include('svapp.api.streams.urls')),
]
