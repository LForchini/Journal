import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
import { DATEONLY, STRING } from 'sequelize';

@Table
export class Entry extends Model {
    @Column(DATEONLY)
    date!: Date;

    @Column(STRING)
    content!: string;

    @Column(STRING)
    user_id!: string;
}

export const sequelize = new Sequelize({
    database: 'journal.db',
    dialect: 'sqlite',
    username: 'root',
    password: '',
    storage: ':memory:',
    models: [Entry],
});
