package services

import (
	config "AuthinGo/config/env"
	db "AuthinGo/db/repositories"
	"AuthinGo/dto"
	utilities "AuthinGo/utilities"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type UserService interface {
	GetUserById() error
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

func (u *UserServiceImpl) GetUserById() error {
	fmt.Println("Fetching user in UserService")
	u.userRepository.GetById()
	return nil
}


func (u *UserServiceImpl) CreateNewUser(payload *dto.CreateUserRequestDTO) error {
	fmt.Println("Adding new User in user service")

	// password := "password123"
	username := payload.Username
	email := payload.Email
	password := payload.Password

	hashedPassword, err := utilities.HashPassword(password)

	if err != nil {
		fmt.Println("Error while hashing in service")
		return nil
	}

	u.userRepository.Create(
		username,
		email,
		hashedPassword,
	)
	return nil
}

func (u *UserServiceImpl) LoginUserService(payload *dto.LoginUserRequestDTO) (string, error) {
	
	email := payload.Email
	password := payload.Password

	user, err := u.userRepository.GetUserByEmail(email)

	if err != nil {
		fmt.Println("Error in getting user")
		return "", err
	}

	response := utilities.CheckPasswordHash(password, user.Password)

	if !response {
		fmt.Println("Error Loging in")
		return  "", nil
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	secretKey := config.GetString("JWT_SECRET", "aneeskolar123")

	if secretKey == "" {
		fmt.Println("Error Fetching secret key from .env")
		return "", nil
	}

	tokenString, err := token.SignedString([]byte(secretKey))

	if err != nil {
		fmt.Println("Error in Signing the JWT token")
		return  "", nil
	}

	fmt.Println("Signing JWT sucessful")
	fmt.Println("Token :", token)
	fmt.Println("Login response", response)
	return tokenString, nil
	
}