package middlewares

import (
	"AuthinGo/dto"
	"AuthinGo/utilities"
	"context"
	"net/http"
)

func UserLoginRequestValidator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		
		var payload dto.LoginUserRequestDTO

		// Read and decode the JSON body into payload
		if err := utilities.ReadJsonBody(r, &payload); err != nil {
			utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid request body", err)
			return 
		}

		// Validate the payload using the Validator instance
		if err := utilities.Validator.Struct(payload); err != nil {
			utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Validation falied err", err)
			return 
		}

		ctx := context.WithValue(r.Context(), "payload", payload) // Create a new context with the payload

		next.ServeHTTP(w, r.WithContext(ctx)) // call the next handler in the chain
	})
}

func UserCreateRequestValidator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload dto.CreateUserRequestDTO

		if err := utilities.ReadJsonBody(r, &payload); err != nil {
			utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid request body", err)
			return
		}

		if err := utilities.Validator.Struct(payload); err != nil {
			utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Validation err failed", err)
			return
		}
		
		ctx := context.WithValue(r.Context(), "payload", payload)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}