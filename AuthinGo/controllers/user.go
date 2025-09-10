package controllers

import (
	"AuthinGo/dto"
	models "AuthinGo/models"
	"AuthinGo/services"
	"AuthinGo/utilities"
	"encoding/json"
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

	uc.UserService.GetUserById()

	response := models.User{
		Id: 	  1,
		Username: "username123",

	}

	josnResponse, err := json.Marshal(response)

	if err != nil {
		fmt.Println("Error in marshalling the response")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(josnResponse)
}

func (uc *UserController) CreateUser(w http.ResponseWriter, r *http.Request) {
	fmt.Println("CreateNewUser called in userController")

	var payload dto.CreateUserRequestDTO

	if jsonErr := utilities.ReadJsonBody(r, &payload); jsonErr != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Something went wrong while creating user", jsonErr)
		return
	}

	if validationErr := utilities.Validator.Struct(payload); validationErr != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid input data", validationErr)
		return
	}

	err := uc.UserService.CreateNewUser(&payload)

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to create user", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "User created sucessfully", nil)
}



func (uc *UserController) LoginUser(w http.ResponseWriter, r *http.Request) {
	fmt.Println("LoginUserService called in userController")

	var payload dto.LoginUserRequestDTO

	if jsonErr := utilities.ReadJsonBody(r, &payload); jsonErr != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Somthing went wrong while logging in", jsonErr)
		return
	}

	if validationErr := utilities.Validator.Struct(payload); validationErr != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid input data", validationErr)
		return
	}

	jwtToken, err := uc.UserService.LoginUserService(&payload)

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to login user", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "User logged in sucessfully", jwtToken)
}