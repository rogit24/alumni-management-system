package com.alumniconnect.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        System.out.println("=================================================");
        System.out.println("OTP CODE FOR " + toEmail + " IS: " + otp);
        System.out.println("=================================================");

        if (mailSender == null) {
            System.out.println("JavaMailSender not configured. Skipping real email dispatch.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Alumni Connect - Email Verification OTP");
            message.setText("Welcome to Alumni Connect!\n\nYour OTP for registration verification is: " + otp + "\n\nThis OTP is valid for 10 minutes.\n\nRegards,\nAlumni Connect Team");
            mailSender.send(message);
            System.out.println("OTP Email successfully sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to dispatch real OTP email: " + e.getMessage());
        }
    }
}
