package db

import (
	"AuthinGo/models"
	"database/sql"
	"fmt"
)

type UserRepository interface {
	GetById() (*models.User, error)
	Create(user string, email string, hashedPassword string) (error)
	GetAll() ([]*models.User, error)
	DeleteById(id int64) error
	GetUserByEmail(email string) (*models.User, error)
}

type UserRepositoryImpl struct {
	db *sql.DB
}

func NewUserRepository(_db *sql.DB) UserRepository {
	return &UserRepositoryImpl{
		db: _db,
	}
}

func (u *UserRepositoryImpl) GetAll() ([]*models.User, error) {
	query := `select id, username, email from users`

	rows, err := u.db.Query(query)

	if err != nil {
		fmt.Println("Error in retriving valuse from the db")
		return nil, err
	}
	defer rows.Close()

	var users []*models.User

	for rows.Next() {
		var u models.User
		err := rows.Scan(&u.Id, &u.Username, &u.Email)

		if err != nil {
			fmt.Println("Error in printing data", err)
		}

		users = append(users, &u)
	}

	err = rows.Err()

	if err != nil {
		fmt.Println("Error int printing the values")
		return nil, err
	}

	return users, nil
}

func (u *UserRepositoryImpl) DeleteById(id int64) (error) {
	query := `DELETE from users where id = ?`

	row, err := u.db.Exec(query, id)

	if err != nil {
		fmt.Println("Error in executing the delete query")
		return err
	}

	result, err := row.RowsAffected()

	if err != nil {
		fmt.Println("Error in checking rows affected")
		return err
	}

	if result == 0 {
		fmt.Printf(`Record with id %d not found`, id)
	}

	fmt.Printf("Record with id %d deleted from the table", id)
	return  nil
}

func (u *UserRepositoryImpl) Create(username string, email string, hashedPassword string) (error) {
	query := `INSERT into users (username, email, password) values (?, ?, ?)`

	result, err := u.db.Exec(query, username, email, hashedPassword)

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

func (u *UserRepositoryImpl) GetUserByEmail(email string) (*models.User, error) {
	fmt.Println("Querying for user using email")

	query := `SELECT id, username, email, password from users where email = ?`

	row := u.db.QueryRow(query, email)

	user := &models.User{}

	err := row.Scan(&user.Id, &user.Username, &user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("User with email not found")
			return nil, err
		} else {
			fmt.Println("Error querying for user using email in UserRepository")
			return nil, err
		}
	}

	fmt.Println("User fetched using email:", email)

	return user, nil

}
