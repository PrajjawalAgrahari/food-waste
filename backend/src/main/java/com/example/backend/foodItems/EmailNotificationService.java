package com.example.backend.foodItems;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service                                                            
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a plain‑text email.
     */
    public void sendSimpleMessage(String to,
                                  String subject,
                                  String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        // Optionally set from:
        // message.setFrom("no-reply@yourdomain.com");
        mailSender.send(message);
    }
}

