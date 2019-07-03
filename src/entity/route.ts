import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { RouteMeta } from './route-meta'

@Entity()
export class Route {
  @PrimaryGeneratedColumn()
  public id: number

  @Column()
  public parentId: number

  @Column()
  public order: number

  @Column({
    length: 80
  })
  public path: string

  @Column({
    length: 80
  })
  public name: string

  @Column({
    length: 80
  })
  public redirect: string

  @Column({
    length: 80
  })
  public component: string

  @OneToOne(type => RouteMeta, routeMeta => routeMeta.route, {
    cascade: true,
  })
  public meta: RouteMeta
}