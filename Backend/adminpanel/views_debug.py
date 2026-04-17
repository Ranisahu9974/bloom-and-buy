
class AdminAllNotificationsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        notifications = Notification.objects.all().order_by('-created_at')[:50]
        data = [
            {
                "id": n.id,
                "user": n.user.username,
                "type": n.type,
                "title": n.title,
                "status": n.status,
                "createdAt": n.created_at
            }
            for n in notifications
        ]
        return Response({"notifications": data})
