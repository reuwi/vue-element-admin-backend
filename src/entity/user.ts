import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm'
import { Role } from './role'
import { Length, IsEmail } from 'class-validator'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({
    length: 80
  })
  @Length(10, 80)
  public username: string

  @Column({
    nullable: true,
    length: 500
  })
  public avatar: string

  @Column({
    length: 80
  })
  @Length(10, 80)
  public password: string

  @ManyToMany(type => Role, role => role.user)
  @JoinTable()
  public roles: Role[]

  @Column({
    length: 100
  })
  @Length(10, 100)
  @IsEmail()
  public email: string
}