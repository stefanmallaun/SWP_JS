import datetime

from flask import Flask, request, jsonify
from sqlalchemy import Column, Integer, Text, Float, DateTime, create_engine, ForeignKey
from sqlalchemy.orm import scoped_session, sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.expression import func, bindparam
from flask_restful import Resource, Api
from dataclasses import dataclass
import json
from flask_cors import CORS, cross_origin

Base = declarative_base()  # Basisklasse aller in SQLAlchemy verwendeten Klassen
metadata = Base.metadata

engine = create_engine('sqlite:///catalog.db')
#engine = create_engine("mysql+pymysql://root:@localhost/catalog")

db_session = scoped_session(sessionmaker(autocommit=False, autoflush=True, bind=engine))
Base.query = db_session.query_property()  # Dadurch hat jedes Base - Objekt (also auch ein GeoInfo) ein Attribut query für Abfragen
app = Flask(__name__)  # Die Flask-Anwendung
cors = CORS(app)  # Ohne dieser Anweisung darf man von Webseiten aus nicht zugrfeifen
api = Api(app)  # Die Flask API


@dataclass  # Diese ermoeglicht das Schreiben als JSON mit jsonify
class Catalog(Base):
    __tablename__ = 'card'  # Abbildung auf diese Tabelle
    id: int
    description: str
    thumb: str

    id = Column(Integer, primary_key=True)
    description = Column(Text)
    thumb = Column(Text)


class CatalogREST(Resource):
    def get(self, id):
        info = Catalog.query.get(id)
        return jsonify(info)

    def put(self, id):
        data = request.get_json(force=True)['info']
        print(data)
        info = Catalog(id=data['id'], description=data['description'], thumb=data['thumb'])
        db_session.add(info)
        db_session.commit()
        db_session.flush()
        return jsonify(info)

    def delete(self, id):
        info = Catalog.query.get(id)
        if info is None:
            return jsonify({'message': 'object with id %d does not exist' % id})
        db_session.delete(info)
        db_session.commit()
        db_session.flush()
        return jsonify({'message': '%d deleted' % id})

    def patch(self, id):
        print(request.json)
        info = Catalog.query.get(id)
        if info is None:
            return jsonify({'message': 'object with id %d does not exist' % id})
        description = request.json['params']['description']
        info.description = description
        db_session.add(info)
        db_session.commit()
        db_session.flush()
        return jsonify({'message': 'object with id %d modified' % id})

    @app.route('/cat-search/<q>')
    def cat_search(q):
        infos = Catalog.query.filter(Catalog.description.contains(q)).all()
        return jsonify(infos)

api.add_resource(CatalogREST, '/cat-item/<int:id>')

@dataclass  # Diese ermoeglicht das Schreiben als JSON mit jsonify
class History(Base):
    __tablename__ = 'history'  # Abbildung auf diese Tabelle
    id: int
    date_added: datetime.datetime
    description: str
    card_id: int

    id = Column(Integer, primary_key=True, autoincrement=True)
    card_id = Column(Integer, ForeignKey("card.id"))
    date_added = Column(DateTime)
    description = Column(Text)

    card = relationship("Catalog", backref="histories")

class HistoryREST(Resource):
    def get(self, id):
        print(id)
        info = History.query.filter(History.card_id == id).all()
        return jsonify(info)

    def put(self, id):
        data = request.get_json(force=True)["params"]
        print(data)
        info = History(card_id=data['card_id'], date_added=func.now(), description=data['description'])
        db_session.add(info)
        db_session.commit()
        db_session.flush()
        return jsonify(info)

    def delete(self, id):
        info = History.query.get(id)
        if info is None:
            return jsonify({'message': 'object with id %d does not exist' % id})
        db_session.delete(info)
        db_session.commit()
        db_session.flush()
        return jsonify({'message': '%d deleted' % id})

    def patch(self, id):
        print(request.json)
        info = History.query.get(id)
        if info is None:
            return jsonify({'message': 'object with id %d does not exist' % id})
        description = request.json['params']['description']
        info.description = description
        info.date_added = func.now()
        db_session.add(info)
        db_session.commit()
        db_session.flush()
        return jsonify({'message': 'object with id %d modified' % id})

api.add_resource(HistoryREST, '/history-item/<int:id>')

def createDb():
    Base.metadata.create_all(bind=engine)
    history = db_session.query(History).all()
    if not history:
        cards = db_session.query(Catalog).all()
        # Iterate over the cards and create a new history instance for each
        # Works only if catalog has already been created by the given files
        for card in cards:
            new_history = History()
            new_history.card_id = card.id
            new_history.description = card.description
            new_history.date_added = func.now()
            db_session.add(new_history)
        db_session.commit()
        db_session.flush()

@app.teardown_appcontext
def shutdown_session(exception=None):
    print("Shutdown Session")
    db_session.remove()

if __name__ == '__main__':
    # if database has not been created, AFTER you created it with the given files
    # use createDB once!
    createDb()
    app.run(debug=True)