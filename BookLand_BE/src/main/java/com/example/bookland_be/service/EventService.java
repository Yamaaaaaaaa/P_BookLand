package com.example.bookland_be.service;

import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.*;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.entity.Event.EventStatus;
import com.example.bookland_be.entity.EventImage.ImageType;
import com.example.bookland_be.enums.EventActionType;
import com.example.bookland_be.enums.EventRuleType;
import com.example.bookland_be.enums.EventTargetType;
import com.example.bookland_be.enums.EventType;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.*;
import com.example.bookland_be.repository.specification.EventSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventImageRepository eventImageRepository;
    private final EventTargetRepository eventTargetRepository;
    private final EventRuleRepository eventRuleRepository;
    private final EventActionRepository eventActionRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final SerieRepository serieRepository;
    private final AuthorRepository authorRepository;
    private final PublisherRepository publisherRepository;

    @Transactional(readOnly = true)
    public Page<EventDTO> getAllEvents(String keyword, EventStatus status, EventType type,
                                       EventTargetType targetType, EventActionType actionType,
                                       EventRuleType ruleType, Long createdById, Integer minPriority,
                                       Boolean activeOnly, LocalDateTime fromDate, LocalDateTime toDate,
                                       Pageable pageable) {
        Specification<Event> spec = Specification.unrestricted();

        // Chỉ thêm vào spec khi có giá trị
        if (keyword != null && !keyword.trim().isEmpty()) {
            spec = spec.and(EventSpecification.searchByKeyword(keyword));
        }

        if (status != null) {
            spec = spec.and(EventSpecification.hasStatus(status));
        }

        if (type != null) {
            spec = spec.and(EventSpecification.hasType(type));
        }

        if (targetType != null) {
            spec = spec.and(EventSpecification.hasTargetType(targetType));
        }

        if (actionType != null) {
            spec = spec.and(EventSpecification.hasActionType(actionType));
        }

        if (ruleType != null) {
            spec = spec.and(EventSpecification.hasRuleType(ruleType));
        }

        if (createdById != null) {
            spec = spec.and(EventSpecification.hasCreator(createdById));
        }

        if (minPriority != null) {
            spec = spec.and(EventSpecification.hasPriorityGreaterThan(minPriority));
        }

        if (fromDate != null || toDate != null) {
            spec = spec.and(EventSpecification.startTimeBetween(fromDate, toDate));
        }

        if (activeOnly != null && activeOnly) {
            spec = spec.and(EventSpecification.isActiveNow());
        }

        return eventRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        return convertToDTO(event);
    }

    @Transactional(readOnly = true)
    public EventDTO getHighestPriorityEvent() {
        LocalDateTime now = LocalDateTime.now();
        Event event = eventRepository.findFirstByStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqualOrderByPriorityDesc(
                EventStatus.ACTIVE, now, now)
                .orElse(null);

        if (event == null) {
            return null;
        }
        return convertToDTO(event);
    }

    @Transactional
    public EventDTO createEvent(EventRequest request) {
        validateEventTime(request.getStartTime(), request.getEndTime());

        // Get creator user
        User creator = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // ========== VALIDATE TARGETS ==========
        if (request.getTargets() != null && !request.getTargets().isEmpty()) {
            validateEventTargets(request.getTargets());
        }

        Event event = Event.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus() != null ? request.getStatus() : EventStatus.DRAFT)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .createdBy(creator)
                .build();

        Event savedEvent = eventRepository.save(event);

        // Add images
        if (request.getMainImageUrls() != null) {
            for (String imageUrl : request.getMainImageUrls()) {
                EventImage image = EventImage.builder()
                        .event(savedEvent)
                        .imageUrl(imageUrl)
                        .imageType(ImageType.MAIN)
                        .build();
                eventImageRepository.save(image);
                savedEvent.getImages().add(image);
            }
        }

        if (request.getSubImageUrls() != null) {
            for (String imageUrl : request.getSubImageUrls()) {
                EventImage image = EventImage.builder()
                        .event(savedEvent)
                        .imageUrl(imageUrl)
                        .imageType(ImageType.SUB)
                        .build();
                eventImageRepository.save(image);
                savedEvent.getImages().add(image);
            }
        }

        // Add targets
        if (request.getTargets() != null) {
            for (EventTargetRequest targetReq : request.getTargets()) {
                EventTarget target = EventTarget.builder()
                        .event(savedEvent)
                        .targetType(targetReq.getTargetType())
                        .targetId(targetReq.getTargetId())
                        .build();
                eventTargetRepository.save(target);
                savedEvent.getTargets().add(target);
            }
        }

        // Add rules
        if (request.getRules() != null) {
            for (EventRuleRequest ruleReq : request.getRules()) {
                EventRule rule = EventRule.builder()
                        .event(savedEvent)
                        .ruleType(ruleReq.getRuleType())
                        .ruleValue(ruleReq.getRuleValue())
                        .build();
                eventRuleRepository.save(rule);
                savedEvent.getRules().add(rule);
            }
        }

        // Add actions
        if (request.getActions() != null) {
            for (EventActionRequest actionReq : request.getActions()) {
                EventAction action = EventAction.builder()
                        .event(savedEvent)
                        .actionType(actionReq.getActionType())
                        .actionValue(actionReq.getActionValue())
                        .build();
                eventActionRepository.save(action);
                savedEvent.getActions().add(action);
            }
        }

        return convertToDTO(savedEvent);
    }

    // ========== VALIDATION METHOD ==========
    private void validateEventTargets(List<EventTargetRequest> targets) {
        for (EventTargetRequest target : targets) {
            switch (target.getTargetType()) {
                case BOOK:
                    if (!bookRepository.existsById(target.getTargetId())) {
                        throw new AppException(ErrorCode.EVENT_TARGET_BOOK_NOT_FOUND);
                    }
                    break;

                case CATEGORY:
                    if (!categoryRepository.existsById(target.getTargetId())) {
                        throw new AppException(ErrorCode.EVENT_TARGET_CATEGORY_NOT_FOUND);
                    }
                    break;

                case SERIES:
                    if (!serieRepository.existsById(target.getTargetId())) {
                        throw new AppException(ErrorCode.EVENT_TARGET_SERIES_NOT_FOUND);
                    }
                    break;

                case AUTHOR:
                    if (!authorRepository.existsById(target.getTargetId())) {
                        throw new AppException(ErrorCode.EVENT_TARGET_AUTHOR_NOT_FOUND);
                    }
                    break;

                case PUBLISHER:
                    if (!publisherRepository.existsById(target.getTargetId())) {
                        throw new AppException(ErrorCode.EVENT_TARGET_PUBLISHER_NOT_FOUND);
                    }
                    break;

                case USER:
                    if (!userRepository.existsById(target.getTargetId())) {
                        throw new AppException(ErrorCode.EVENT_TARGET_USER_NOT_FOUND);
                    }
                    break;

                case ALL:
                case ALL_ORDERS:
                case FIRST_ORDER:
                case NEW_USER:
                case VIP_USER:
                case USER_GROUP:
                case LOCATION:
                    // Không cần validate cho các loại này
                    break;
            }
        }
    }

    @Transactional
    public EventDTO updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        validateEventTime(request.getStartTime(), request.getEndTime());

        if (request.getTargets() != null && !request.getTargets().isEmpty()) {
            validateEventTargets(request.getTargets());
        }

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setType(request.getType());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setStatus(request.getStatus() != null ? request.getStatus() : event.getStatus());
        event.setPriority(request.getPriority() != null ? request.getPriority() : event.getPriority());

        // Update creator if changed
        if (request.getCreatedById() != null &&
                (event.getCreatedBy() == null || !event.getCreatedBy().getId().equals(request.getCreatedById()))) {
            User creator = userRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            event.setCreatedBy(creator);
        }

        // Update images - remove old and add new
        event.getImages().clear();
        eventImageRepository.flush();

        if (request.getMainImageUrls() != null) {
            for (String imageUrl : request.getMainImageUrls()) {
                EventImage image = EventImage.builder()
                        .event(event)
                        .imageUrl(imageUrl)
                        .imageType(ImageType.MAIN)
                        .build();
                eventImageRepository.save(image);
                event.getImages().add(image);
            }
        }

        if (request.getSubImageUrls() != null) {
            for (String imageUrl : request.getSubImageUrls()) {
                EventImage image = EventImage.builder()
                        .event(event)
                        .imageUrl(imageUrl)
                        .imageType(ImageType.SUB)
                        .build();
                eventImageRepository.save(image);
                event.getImages().add(image);
            }
        }

        // Update targets
        event.getTargets().clear();
        eventTargetRepository.flush();

        if (request.getTargets() != null) {
            for (EventTargetRequest targetReq : request.getTargets()) {
                EventTarget target = EventTarget.builder()
                        .event(event)
                        .targetType(targetReq.getTargetType())
                        .targetId(targetReq.getTargetId())
                        .build();
                eventTargetRepository.save(target);
                event.getTargets().add(target);
            }
        }

        // Update rules
        event.getRules().clear();
        eventRuleRepository.flush();

        if (request.getRules() != null) {
            for (EventRuleRequest ruleReq : request.getRules()) {
                EventRule rule = EventRule.builder()
                        .event(event)
                        .ruleType(ruleReq.getRuleType())
                        .ruleValue(ruleReq.getRuleValue())
                        .build();
                eventRuleRepository.save(rule);
                event.getRules().add(rule);
            }
        }

        // Update actions
        event.getActions().clear();
        eventActionRepository.flush();

        if (request.getActions() != null) {
            for (EventActionRequest actionReq : request.getActions()) {
                EventAction action = EventAction.builder()
                        .event(event)
                        .actionType(actionReq.getActionType())
                        .actionValue(actionReq.getActionValue())
                        .build();
                eventActionRepository.save(action);
                event.getActions().add(action);
            }
        }

        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    @Transactional
    public EventDTO updateEventStatus(Long id, EventStatus status) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        event.setStatus(status);
        Event updatedEvent = eventRepository.save(event);

        return convertToDTO(updatedEvent);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (!event.getLogs().isEmpty()) {
            throw new AppException(ErrorCode.EVENT_HAS_LOGS);
        }

        eventRepository.delete(event);
    }

    private void validateEventTime(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime.isAfter(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }
    }

    private EventDTO convertToDTO(Event event) {
        List<EventImageDTO> imageDTOs = event.getImages().stream()
                .map(img -> EventImageDTO.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .imageType(img.getImageType())
                        .build())
                .collect(Collectors.toList());

        List<EventTargetDTO> targetDTOs = event.getTargets().stream()
                .map(target -> EventTargetDTO.builder()
                        .id(target.getId())
                        .targetType(target.getTargetType())
                        .targetId(target.getTargetId())
                        .build())
                .collect(Collectors.toList());

        List<EventRuleDTO> ruleDTOs = event.getRules().stream()
                .map(rule -> EventRuleDTO.builder()
                        .id(rule.getId())
                        .ruleType(rule.getRuleType())
                        .ruleValue(rule.getRuleValue())
                        .build())
                .collect(Collectors.toList());

        List<EventActionDTO> actionDTOs = event.getActions().stream()
                .map(action -> EventActionDTO.builder()
                        .id(action.getId())
                        .actionType(action.getActionType())
                        .actionValue(action.getActionValue())
                        .build())
                .collect(Collectors.toList());

        return EventDTO.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .type(event.getType())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .status(event.getStatus())
                .priority(event.getPriority())
                .createdById(event.getCreatedBy() != null ? event.getCreatedBy().getId() : null)
                .createdByName(event.getCreatedBy() != null ? event.getCreatedBy().getUsername() : null)
                .createdAt(event.getCreatedAt())
                .isActive(event.isActive())
                .images(imageDTOs)
                .targets(targetDTOs)
                .rules(ruleDTOs)
                .actions(actionDTOs)
                .build();
    }
}
