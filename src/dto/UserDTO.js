class UserDTO {
  constructor(user) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
    this.studentId = user.studentId;
    this.phone = user.phone;
    this.address = user.address;
    this.dateOfBirth = user.dateOfBirth;
    this.isActive = user.isActive;
    this.lastLoginAt = user.lastLoginAt;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

class UserCreateDTO {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.studentId = data.studentId;
    this.phone = data.phone;
    this.address = data.address;
    this.dateOfBirth = data.dateOfBirth;
  }
}

class UserUpdateDTO {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.dateOfBirth = data.dateOfBirth;
    this.isActive = data.isActive;
  }
}

class LoginDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  }
}

module.exports = {
  UserDTO,
  UserCreateDTO,
  UserUpdateDTO,
  LoginDTO
};
