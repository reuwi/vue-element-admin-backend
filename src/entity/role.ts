import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm'
import { Route } from './route'

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({
    length: 80
  })
  public key: string

  @Column({
    length: 80
  })
  public name: string

  @Column({
    length: 80
  })
  public description: string

  @ManyToMany(type => Route, route => route.roles)
  public route: Route[]
}