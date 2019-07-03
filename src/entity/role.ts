import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm'
import { RouteMeta } from './route-meta'

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

  @ManyToMany(type => RouteMeta, routeMeta => routeMeta.roles)
  public routeMeta: RouteMeta[]
}