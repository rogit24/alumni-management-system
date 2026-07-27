package com.alumniconnect.template.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "USER-SERVICE",
        path = "/api/v1/auth"
)
public interface UserServiceClient {

    @GetMapping("/users/{id}")
    Object getUserById(@PathVariable("id") Long id);

}