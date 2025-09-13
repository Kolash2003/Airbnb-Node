package controllers

import (
	"AuthinGo/dto"
	"AuthinGo/services"
	"AuthinGo/utilities"
	"fmt"
	"net/http"
)

type UserController struct {
	UserService services.UserService
}

func NewUserController(_userService services.UserService) *UserController {
	return &UserController{
		UserService: _userService,
	}
}

func (uc *UserController) GetUserById(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GetUserById called in userController")

	userId := r.URL.Query().Get("id")

	if userId == "" {
		userId = r.Context().Value("userId").(string)
	}

	fmt.Println("User ID from context or query", userId)

	if userId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "User ID is required", fmt.Errorf("Missing user id"))
		return
	}

	user, err := uc.UserService.GetUserById(userId)

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to fetch user", err)
		return
	}

	if user == nil {
		utilities.WriteJsonErrorResponse(w, http.StatusNotFound, "User not found", fmt.Errorf("User not found"))
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "User details", user)
	fmt.Println("User fetched sucessfully", user)
}

func (uc *UserController) CreateUser(w http.ResponseWriter, r *http.Request) {

	payload := r.Context().Value("payload").(dto.CreateUserRequestDTO)
	
	err := uc.UserService.CreateNewUser(&payload)

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to create user", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "User created sucessfully", nil)
}


func (uc *UserController) LoginUser(w http.ResponseWriter, r *http.Request) {
	
	payload := r.Context().Value("payload").(dto.LoginUserRequestDTO)

	jwtToken, err := uc.UserService.LoginUserService(&payload)

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to login user", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "User logged in sucessfully", jwtToken)
}