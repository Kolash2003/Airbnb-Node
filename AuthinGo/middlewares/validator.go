package middlewares

import (
	"AuthinGo/utilities"
	"net/http"
)

func RequestValidator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload any

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

		next.ServeHTTP(w, r) // call the next handler in the chain
	})
}