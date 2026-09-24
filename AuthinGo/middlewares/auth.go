package middlewares

import (
	env "AuthinGo/config/env"
	dbconfig "AuthinGo/config/db"
	repo "AuthinGo/db/repositories"
	"AuthinGo/utilities"
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func JWTAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		//  if the string is empty then return unauthorised
		if authHeader == "" { 
			utilities.WriteJsonErrorResponse(w, http.StatusUnauthorized, "Authorization header is required", fmt.Errorf("missing authorization header"))
			return 
		}

		// if the Auth header is starting with Bearer or not
		if !strings.HasPrefix(authHeader, "Bearer ") {
			utilities.WriteJsonErrorResponse(w, http.StatusUnauthorized, "Authorization header must start with Bearer", fmt.Errorf("invalid authorization format"))
			return 
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		if token == "" {
			utilities.WriteJsonErrorResponse(w, http.StatusUnauthorized, "Token is required", fmt.Errorf("token is required"))
			return 
		}

		claims := jwt.MapClaims{}

		_, err := jwt.ParseWithClaims(token, &claims,func (token *jwt.Token) (interface{}, error) {
			return []byte(env.GetString("JWT_SECRET", "aneeskolar123")), nil
		})

		if err != nil {
			utilities.WriteJsonErrorResponse(w, http.StatusUnauthorized, "Invalid token: "+err.Error(), err)
			return
		}

		userId, okId := claims["id"].(float64)
		email, okEmail := claims["email"].(string)

		if !okId || !okEmail {
			utilities.WriteJsonErrorResponse(w, http.StatusUnauthorized, "Invalid token claims", fmt.Errorf("invalid token claims"))
			return 
		}

		fmt.Println("Authenticated user ID:", int64(userId), "Email:", email)

		ctx := context.WithValue(r.Context(), "userId", strconv.FormatFloat(userId, 'f', 0, 64))
		ctx = context.WithValue(ctx, "email", email)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RequireAllRoles(roles ...string) func(http.Handler) http.Handler{

	// function that can create a middleware for checking the above set of roles

	return func(next http.Handler) http.Handler {

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			userIdStr := r.Context().Value("userId").(string)
			userId, err := strconv.ParseInt(userIdStr, 10, 64)

			if err != nil {
				utilities.WriteJsonErrorResponse(w, http.StatusUnauthorized, "Internal user ID", err)
				return
			}

			dbConn, dbErr := dbconfig.SetupDB()

			if dbErr != nil {
				utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Database connection error", dbErr)
				return 
			}

			urr := repo.NewUserRoleRepository(dbConn)

			hasAllRoles, hasAllRolesErr := urr.HasAllRoles(userId, roles)
			
			if hasAllRolesErr != nil {
				utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Error checking user roles", hasAllRolesErr)
				return 
			}

			if !hasAllRoles {
				utilities.WriteJsonErrorResponse(w, http.StatusForbidden, "Forbidden: You do not have the required roles", fmt.Errorf("forbidden"))
				return
			}

			fmt.Println("User has all required roles:", roles)

			next.ServeHTTP(w, r)

		})
	}
}

func RequireAnyRole(roles ...string) func(http.Handler) http.Handler{

	// function that can create a middleware for checking the above set of roles

	return func(next http.Handler) http.Handler {

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			userIdStr := r.Context().Value("userId").(string)
			userId, err := strconv.ParseInt(userIdStr, 10, 64)

			if err != nil {
				utilities.WriteJsonErrorResponse(w, http.StatusUnauthorized, "Internal user ID", err)
				return
			}

			dbConn, dbErr := dbconfig.SetupDB()

			if dbErr != nil {
				utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Database connection error", dbErr)
				return 
			}

			urr := repo.NewUserRoleRepository(dbConn)

			hasAnyRole, hasAnyRoleErr := urr.HasAnyRole(userId, roles)
			fmt.Println("userid", userId, "roles", roles, "hasAnyRole", hasAnyRole)
			if hasAnyRoleErr != nil {
				utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Error checking user roles", hasAnyRoleErr)
				return 
			}

			if !hasAnyRole {
				utilities.WriteJsonErrorResponse(w, http.StatusForbidden, "Forbidden: You do not have the required roles", fmt.Errorf("forbidden"))
				return
			}

			fmt.Println("User has at least one of the required roles:", roles)

			next.ServeHTTP(w, r)
			
		})
	}
}