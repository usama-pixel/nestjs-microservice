import { FilterQuery, Model, Types, UpdateQuery } from "mongoose";
import { AbstractDocument } from "./abstract.schema";
import { Logger, NotFoundException } from "@nestjs/common";

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;
  constructor(protected readonly model: Model<TDocument>) {}
  
  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId()
    })
    return ((await createdDocument.save()).toJSON()) as unknown as TDocument
  }

  async findOne(filtereQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filtereQuery, {}, {lean: true})
    if(!document) {
      this.logger.warn('Document was not found', filtereQuery)
      throw new NotFoundException('Document not found')
    }
    return document as unknown as TDocument;
  }
  async findOneAndUpdate(
    filtereQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ) {
    const document = await this.model.findOneAndUpdate(filtereQuery, update, {
      lean: true,
      new: true
    })
    if(!document) {
      this.logger.warn('Document was not found', filtereQuery)
      throw new NotFoundException('Document not found')
    }
    return document;
  }

  async find(filtereQuery: FilterQuery<TDocument>) {
    return this.model.find(filtereQuery, {}, {lean: true})
  }

  async findOneAndDelete(filtereQuery: FilterQuery<TDocument>) {
    return this.model.findOneAndDelete(filtereQuery, {lean: true})
  }
}