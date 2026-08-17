package com.nixtap.feedbackservice.mapper;

import com.nixtap.feedbackservice.dto.response.FeedbackResponse;
import com.nixtap.feedbackservice.entity.Feedback;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    FeedbackResponse toResponse(Feedback entity);
}
