import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
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
    length: 80
  })
  @Length(10, 80)
  public password: string

  @Column({
    length: 100
  })
  @Length(10, 100)
  @IsEmail()
  public email: string
}