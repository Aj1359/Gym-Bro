package com.example.demo.notification;

import com.example.demo.notification.dto.NotificationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(UUID userId, String title, String body, String type) {
        notificationRepository.save(new Notification(userId, title, body, type));
    }

    public List<NotificationResponse> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(n -> new NotificationResponse(n.getId(), n.getTitle(), n.getBody(), n.getType(), n.isRead(), n.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!n.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Notification not found");
        }
        n.markRead();
        notificationRepository.save(n);
    }
}
