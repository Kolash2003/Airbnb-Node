package db

import (
	"AuthinGo/models"
	"database/sql"
	"fmt"
)

type UserRepository interface {
	GetById() (*models.User, error)
	Create() (error)
}

type UserRepositoryImpl struct {
	db *sql.DB
}

func NewUserRepository(_db *sql.DB) UserRepository {
	return &UserRepositoryImpl{
		db: _db,
	}
}

func (u *UserRepositoryImpl) Create() (error) {
	query := `INSERT into users (username, email, password) values (?, ?, ?)`

	result, err := u.db.Exec(query, "testuser", "test@test.com", "password123")

	if err != nil {
		fmt.Println("Error inserting user")
		return nil
	}

	rows, rowErr := result.RowsAffected()

	if rowErr != nil {
		fmt.Println("Error fetching rows affected")
		return nil
	}

	if rows == 0 {
		fmt.Println("No rows affected")
		return nil
	}

	fmt.Println("user created sucessfully:", rows)

	return nil
}

func (u *UserRepositoryImpl) GetById() (*models.User, error){
	fmt.Println("creating an entry into db")

	query := `SELECT id, username, email, password, created_at, updated_at from users WHERE id = ?`

	row := u.db.QueryRow(query, 1)

	user := &models.User{}

	err := row.Scan(&user.Id, &user.Username, &user.Email, &user.Password, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("No user foung with given Id")
			return nil, err
		} else {
			fmt.Println("Error scanning user:", err)
			return nil, err
		}
	}

	fmt.Println("User fetched sucessfully :", user)

	return user, nil
}
