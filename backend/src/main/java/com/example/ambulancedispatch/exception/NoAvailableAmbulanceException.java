package com.example.ambulancedispatch.exception;

public class NoAvailableAmbulanceException extends RuntimeException {
    public NoAvailableAmbulanceException(String message) {
        super(message);
    }
}
