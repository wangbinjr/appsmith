/* Copyright 2019-2023 Appsmith */
package com.external.plugins.exceptions;

import com.appsmith.external.exceptions.AppsmithErrorAction;
import com.appsmith.external.exceptions.pluginExceptions.BasePluginError;
import com.appsmith.external.models.ErrorType;
import java.text.MessageFormat;
import lombok.Getter;

@Getter
public enum GraphQLPluginError implements BasePluginError {
    QUERY_EXECUTION_FAILED(
            500,
            "PE-GQL-5000",
            "{0}",
            AppsmithErrorAction.LOG_EXTERNALLY,
            "Query execution error",
            ErrorType.INTERNAL_ERROR,
            "{1}",
            "{2}"),
    ;
    private final Integer httpErrorCode;
    private final String appErrorCode;
    private final String message;
    private final String title;
    private final AppsmithErrorAction errorAction;
    private final ErrorType errorType;

    private final String downstreamErrorMessage;

    private final String downstreamErrorCode;

    GraphQLPluginError(
            Integer httpErrorCode,
            String appErrorCode,
            String message,
            AppsmithErrorAction errorAction,
            String title,
            ErrorType errorType,
            String downstreamErrorMessage,
            String downstreamErrorCode) {
        this.httpErrorCode = httpErrorCode;
        this.appErrorCode = appErrorCode;
        this.errorType = errorType;
        this.errorAction = errorAction;
        this.message = message;
        this.title = title;
        this.downstreamErrorMessage = downstreamErrorMessage;
        this.downstreamErrorCode = downstreamErrorCode;
    }

    public String getMessage(Object... args) {
        return new MessageFormat(this.message).format(args);
    }

    public String getErrorType() {
        return this.errorType.toString();
    }

    public String getDownstreamErrorMessage(Object... args) {
        return replacePlaceholderWithValue(this.downstreamErrorMessage, args);
    }

    public String getDownstreamErrorCode(Object... args) {
        return replacePlaceholderWithValue(this.downstreamErrorCode, args);
    }
}
