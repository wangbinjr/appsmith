/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.solutions;

import com.appsmith.server.solutions.ce.ApplicationPermissionCEImpl;

import org.springframework.stereotype.Component;

@Component
public class ApplicationPermissionImpl extends ApplicationPermissionCEImpl
        implements ApplicationPermission {}
