/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.services;

import com.appsmith.server.repositories.TenantRepository;
import com.appsmith.server.services.ce.TenantServiceCEImpl;

import jakarta.validation.Validator;

import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.stereotype.Service;

import reactor.core.scheduler.Scheduler;

@Service
public class TenantServiceImpl extends TenantServiceCEImpl implements TenantService {

    public TenantServiceImpl(
            Scheduler scheduler,
            Validator validator,
            MongoConverter mongoConverter,
            ReactiveMongoTemplate reactiveMongoTemplate,
            TenantRepository repository,
            AnalyticsService analyticsService,
            ConfigService configService) {
        super(
                scheduler,
                validator,
                mongoConverter,
                reactiveMongoTemplate,
                repository,
                analyticsService,
                configService);
    }
}
