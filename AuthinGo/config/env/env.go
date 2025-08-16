package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

func Load() {
	err := godotenv.Load()

	if err != nil {
		log.Printf("Warning: could not load .env file: %v", err)
	}
}

func GetString(key string, fallback string) string {
	value, ok := os.LookupEnv(key)

	if !ok {
		return fallback
	}

	return value
}

func GetInt(key string, fallback int) int {

	value, ok := os.LookupEnv(key)

	if !ok {
		return fallback
	}

	intValue, err := strconv.Atoi(value)

	if err != nil {
		log.Printf("Warning: could not parse env var %s as int: %v. Using fallback %d", key, err, fallback)
		return fallback
	}

	return intValue

}

func GetBool(key string, fallback bool) bool {

	value, ok := os.LookupEnv(key)

	if !ok {
		return fallback
	}

	boolValue, err := strconv.ParseBool(value)

	if err != nil {
		log.Printf("Warning: could not parse env var %s as bool: %v. Using fallback %t", key, err, fallback)
		return fallback
	}

	return boolValue
}
