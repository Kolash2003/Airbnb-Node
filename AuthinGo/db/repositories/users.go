package db

import (
	"AuthinGo/models"
	"database/sql"
	"fmt"
)

type UserRepository interface {
	GetById(id string) (*models.User, error)
	Create(user string, email string, hashedPassword string) (error)
	GetAll() ([]*models.User, error)
	DeleteById(id int64) error
	GetUserByEmail(email string) (*models.User, error)
	Update(id int64, username string, email string) (*models.User, error)
	UpdatePassword(id int64, hashedPassword string) error
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
	query := `DELETE from users where id = $1`

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

func (u *UserRepositoryImpl) Create(username string, email string, hashedPassword string) error {
	query := `INSERT into users (username, email, password) values ($1, $2, $3) RETURNING id`

	var userId int64
	err := u.db.QueryRow(query, username, email, hashedPassword).Scan(&userId)
	if err != nil {
		fmt.Println("Error inserting user:", err)
		return err
	}

	// Assign default role 'user'
	var roleId int64
	err = u.db.QueryRow(`SELECT id FROM roles WHERE name = $1`, "user").Scan(&roleId)
	if err == nil {
		_, _ = u.db.Exec(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userId, roleId)
	}

	fmt.Println("User created successfully with ID:", userId)
	return nil
}

func (u *UserRepositoryImpl) GetById(id string) (*models.User, error){

	query := `SELECT id, username, email, password, created_at, updated_at from users WHERE id = $1`

	row := u.db.QueryRow(query, id)

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

	query := `SELECT id, username, email, password from users where email = $1`

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

func (u *UserRepositoryImpl) Update(id int64, username string, email string) (*models.User, error) {
	query := `UPDATE users SET username = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, password, created_at, updated_at`

	row := u.db.QueryRow(query, username, email, id)

	user := &models.User{}

	err := row.Scan(&user.Id, &user.Username, &user.Email, &user.Password, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		fmt.Println("Error updating user:", err)
		return nil, err
	}

	fmt.Println("User updated successfully:", user)

	return user, nil
}

func (u *UserRepositoryImpl) UpdatePassword(id int64, hashedPassword string) error {
	query := `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`

	result, err := u.db.Exec(query, hashedPassword, id)
	if err != nil {
		fmt.Println("Error updating password:", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		fmt.Println("Error checking rows affected:", err)
		return err
	}

	if rowsAffected == 0 {
		fmt.Printf("User with id %d not found", id)
		return fmt.Errorf("user with id %d not found", id)
	}

	fmt.Println("Password updated successfully for user:", id)

	return nil
}
