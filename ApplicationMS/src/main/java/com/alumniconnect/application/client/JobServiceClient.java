package com.alumniconnect.application.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name="job-service")
public interface JobServiceClient {

	 @GetMapping("/api/v1/jobs/{id}")
	    Object getJobById(@PathVariable Long id);
}
