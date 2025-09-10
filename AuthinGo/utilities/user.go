package utilities

import (

	"fmt"
	"golang.org/x/crypto/bcrypt"
)


func HashPassword(UserPassword string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(UserPassword), bcrypt.DefaultCost)

	if err != nil {
		fmt.Println("Error in hashingh the password")
		return "", err
	}

	return string(hashedPassword), nil
}

func CheckPasswordHash(UserPassword string, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(UserPassword))

	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			fmt.Println("Password does not match !")
			return false
		} else {
			fmt.Println("Error comparing hash and password")
			return  false
		}
	}

	fmt.Println("Password Matched")

	return true

}



