package dto

type LoginUserRequestDTO struct {
	Email 		string		`json:"email" validate:"required,email"`
	Password	string		`json:"password" validate:"required,min=8"`
}

type CreateUserRequestDTO struct {
	Username	string		`json:"username" validate:"required"`
	Email		string		`json:"email" validate:"required,email"`
	Password	string		`json:"password" validate:"required,min=8"`
}

type GetUserByIdDTO struct {
	Id			int			`json:"id" validate:"required"`
}

type UpdateUserRequestDTO struct {
	Username	string		`json:"username" validate:"omitempty,min=1"`
	Email		string		`json:"email" validate:"omitempty,email"`
}

type ChangePasswordRequestDTO struct {
	CurrentPassword	string		`json:"currentPassword" validate:"required,min=8"`
	NewPassword		string		`json:"newPassword" validate:"required,min=8"`
}