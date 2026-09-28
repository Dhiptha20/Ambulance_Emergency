package com.example.ambulancedispatch.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ambulanceDispatchOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AmbulanceDispatch REST API")
                        .description("Backend APIs for Nearest Ambulance Allocation and Emergency Management System")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("AmbulanceDispatch Engineering")
                                .email("support@ambulancedispatch.local"))
                        .license(new License().name("MIT License").url("https://opensource.org/licenses/MIT")));
    }
}
