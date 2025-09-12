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

	var payload dto.GetUserByIdDTO

	
	if jsonErr := utilities.ReadJsonBody(r, &payload); jsonErr != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Something went wrong while getting user by Id", jsonErr)
		return
	}
	
	if validationErr := utilities.Validator.Struct(payload); validationErr != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid input data", validationErr)
		return
	}

	user, err := uc.UserService.GetUserById(&payload)

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to get user by Id", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "User details", user)
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