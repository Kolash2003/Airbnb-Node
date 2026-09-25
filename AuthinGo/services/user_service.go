package services

import (
	env "AuthinGo/config/env"
	db "AuthinGo/db/repositories"
	"AuthinGo/dto"
	"AuthinGo/models"
	utilities "AuthinGo/utilities"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type UserService interface {
	GetUserById(id string) (*models.User, error)
	CreateNewUser(payload *dto.CreateUserRequestDTO) error
	LoginUserService(payload *dto.LoginUserRequestDTO) (string, error)
	UpdateUser(id int64, payload *dto.UpdateUserRequestDTO) (*models.User, error)
	ChangePassword(id int64, payload *dto.ChangePasswordRequestDTO) error
}

type UserServiceImpl struct {
	userRepository db.UserRepository
}

func NewUserService(_userRepository db.UserRepository) UserService {
	return &UserServiceImpl{
		userRepository: _userRepository,
	}
}

func (u *UserServiceImpl) GetUserById(id string) (*models.User, error) {
	fmt.Println("Fetching user in UserService")
	
	user, err := u.userRepository.GetById(id)

	if err != nil {
		fmt.Println("Error in Getting user by Id")
		return nil, err
	}

	return user, nil
}


func (u *UserServiceImpl) CreateNewUser(payload *dto.CreateUserRequestDTO) error {
	fmt.Println("Adding new User in user service")

	username := payload.Username
	email := payload.Email
	password := payload.Password

	hashedPassword, err := utilities.HashPassword(password)
	if err != nil {
		fmt.Println("Error while hashing in service")
		return err
	}

	return u.userRepository.Create(
		username,
		email,
		hashedPassword,
	)
}

func (u *UserServiceImpl) LoginUserService(payload *dto.LoginUserRequestDTO) (string, error) {
	email := payload.Email
	password := payload.Password

	user, err := u.userRepository.GetUserByEmail(email)
	if err != nil {
		fmt.Println("Error in getting user:", err)
		return "", fmt.Errorf("invalid email or password")
	}

	response := utilities.CheckPasswordHash(password, user.Password)
	if !response {
		fmt.Println("Error Logging in: password mismatch")
		return "", fmt.Errorf("invalid email or password")
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
		"id":    user.Id,
	})

	tokenString, err := token.SignedString([]byte(env.GetString("JWT_SECRET", "aneeskolar123")))
	if err != nil {
		fmt.Println("Error in Signing the JWT token:", err)
		return "", err
	}

	fmt.Println("Signing JWT successful")
	return tokenString, nil
}

func (u *UserServiceImpl) UpdateUser(id int64, payload *dto.UpdateUserRequestDTO) (*models.User, error) {
	fmt.Println("Updating user in UserService")

	current, err := u.userRepository.GetById(strconv.FormatInt(id, 10))
	if err != nil {
		fmt.Println("Error fetching current user:", err)
		return nil, err
	}

	username := current.Username
	if payload.Username != "" {
		username = payload.Username
	}

	email := current.Email
	if payload.Email != "" {
		email = payload.Email
	}

	return u.userRepository.Update(id, username, email)
}

func (u *UserServiceImpl) ChangePassword(id int64, payload *dto.ChangePasswordRequestDTO) error {
	fmt.Println("Changing password in UserService")

	current, err := u.userRepository.GetById(strconv.FormatInt(id, 10))
	if err != nil {
		fmt.Println("Error fetching current user:", err)
		return err
	}

	if !utilities.CheckPasswordHash(payload.CurrentPassword, current.Password) {
		fmt.Println("Current password mismatch")
		return fmt.Errorf("current password is incorrect")
	}

	hashedPassword, err := utilities.HashPassword(payload.NewPassword)
	if err != nil {
		fmt.Println("Error hashing new password:", err)
		return err
	}

	return u.userRepository.UpdatePassword(id, hashedPassword)
}