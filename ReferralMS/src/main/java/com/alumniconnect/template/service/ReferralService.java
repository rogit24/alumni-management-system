package com.alumniconnect.template.service;

import java.time.LocalDate;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.alumniconnect.template.client.MessageClient;
import com.alumniconnect.template.client.NotificationClient;
import com.alumniconnect.template.client.UserServiceClient;
import com.alumniconnect.template.dto.MessageDto;
import com.alumniconnect.template.dto.NotificationDto;
import com.alumniconnect.template.dto.ReferralRequestDto;
import com.alumniconnect.template.dto.UserDto;
import com.alumniconnect.template.entity.ReferralRequest;
import com.alumniconnect.template.enums.ReferralStatus;
import com.alumniconnect.template.exception.ResourceNotFoundException;
import com.alumniconnect.template.repository.ReferralRepository;

@Service
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final ModelMapper modelMapper;
    private final UserServiceClient userServiceClient;
    private final NotificationClient notificationClient;
    private final MessageClient messageClient;

    public ReferralService(ReferralRepository referralRepository,
                           ModelMapper modelMapper,
                           UserServiceClient userServiceClient,
                           NotificationClient notificationClient,
                           MessageClient messageClient) {

        this.referralRepository = referralRepository;
        this.modelMapper = modelMapper;
        this.userServiceClient = userServiceClient;
        this.notificationClient = notificationClient;
        this.messageClient = messageClient;
    }

    // Get Student Details
    public Object getStudentDetails(Long studentId) {
        return userServiceClient.getUserById(studentId);
    }

    // Create Referral
    public ReferralRequestDto saveReferral(ReferralRequestDto dto) {

        ReferralRequest referralRequest =
                modelMapper.map(dto, ReferralRequest.class);

        // Default Status
        referralRequest.setStatus(ReferralStatus.PENDING);

        ReferralRequest savedReferral =
                referralRepository.save(referralRequest);

        // Fetch Student and Alumni info for identity propagation and receiver info
        try {
            UserDto student = userServiceClient.getUserById(dto.getStudentId());
            UserDto alumni = userServiceClient.getUserById(dto.getAlumniId());
            
            if (student != null && alumni != null) {
                MessageDto message = new MessageDto();
                message.setReceiverId(alumni.getId());
                message.setReceiverEmail(alumni.getEmail());
                message.setMessageContent("Hi, I have requested a referral for the role of " 
                        + dto.getJobRole() + " at " + dto.getCompany() + ". Message: " + dto.getMessage());
                
                messageClient.sendMessage(
                    message,
                    student.getId().toString(),
                    student.getEmail(),
                    student.getRole()
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to send referral orchestration chat message: " + e.getMessage());
        }

        // Send Notification
        NotificationDto notification = new NotificationDto();
        notification.setUserId(savedReferral.getStudentId());
        notification.setTitle("Referral Request Submitted");
        notification.setMessage(
                "Your referral request for "
                        + savedReferral.getCompany()
                        + " (" + savedReferral.getJobRole()
                        + ") has been submitted successfully."
        );
        notification.setType("REFERRAL");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDate.now().toString());

        notificationClient.createNotification(notification);

        return modelMapper.map(savedReferral, ReferralRequestDto.class);
    }

    // Update Referral
    public ReferralRequestDto updateReferral(Long id,
                                             ReferralRequestDto dto) {

        ReferralRequest referral = referralRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Referral not found with id : " + id));

        referral.setStudentId(dto.getStudentId());
        referral.setAlumniId(dto.getAlumniId());
        referral.setCompany(dto.getCompany());
        referral.setJobRole(dto.getJobRole());
        referral.setMessage(dto.getMessage());
        referral.setRequestDate(dto.getRequestDate());

        ReferralRequest updatedReferral =
                referralRepository.save(referral);

        return modelMapper.map(updatedReferral, ReferralRequestDto.class);
    }

    // Approve Referral
    public ReferralRequest approveReferral(Long id) {

        ReferralRequest referral = referralRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Referral not found with id : " + id));

        referral.setStatus(ReferralStatus.APPROVED);

        ReferralRequest updatedReferral =
                referralRepository.save(referral);

        // Send Notification
        NotificationDto notification = new NotificationDto();
        notification.setUserId(updatedReferral.getStudentId());
        notification.setTitle("Referral Approved");
        notification.setMessage(
                "Congratulations! Your referral request for "
                        + updatedReferral.getCompany()
                        + " has been approved."
        );
        notification.setType("REFERRAL");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDate.now().toString());

        notificationClient.createNotification(notification);

        return updatedReferral;
    }

    // Reject Referral
    public ReferralRequest rejectReferral(Long id) {

        ReferralRequest referral = referralRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Referral not found with id : " + id));

        referral.setStatus(ReferralStatus.REJECTED);

        ReferralRequest updatedReferral =
                referralRepository.save(referral);

        // Send Notification
        NotificationDto notification = new NotificationDto();
        notification.setUserId(updatedReferral.getStudentId());
        notification.setTitle("Referral Rejected");
        notification.setMessage(
                "Your referral request for "
                        + updatedReferral.getCompany()
                        + " has been rejected."
        );
        notification.setType("REFERRAL");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDate.now().toString());

        notificationClient.createNotification(notification);

        return updatedReferral;
    }

    // Get All Referrals
    public List<ReferralRequest> getAllReferrals() {
        return referralRepository.findAll();
    }

    // Get Referral By Id
    public ReferralRequest getReferralById(Long id) {

        return referralRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Referral not found with id : " + id));
    }

    // Student Referrals
    public List<ReferralRequest> getStudentReferrals(Long studentId) {
        return referralRepository.findByStudentId(studentId);
    }

    // Alumni Referrals
    public List<ReferralRequest> getAlumniReferrals(Long alumniId) {
        return referralRepository.findByAlumniId(alumniId);
    }

    // Pending Referrals
    public List<ReferralRequest> getPendingReferrals() {
        return referralRepository.findByStatus(ReferralStatus.PENDING);
    }

    // Delete Referral
    public void deleteReferral(Long id) {

        ReferralRequest referral = referralRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Referral not found with id : " + id));

        referralRepository.delete(referral);
    }
}