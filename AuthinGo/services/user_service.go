package services

import (
	env "AuthinGo/config/env"
	db "AuthinGo/db/repositories"
	"AuthinGo/dto"
	"AuthinGo/models"
	utilities "AuthinGo/utilities"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type UserService interface {
	GetUserById(id string) (*models.User, error)
	CreateNewUser(payload *dto.CreateUserRequestDTO) error
	LoginUserService(payload *dto.LoginUserRequestDTO) (string, error)
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