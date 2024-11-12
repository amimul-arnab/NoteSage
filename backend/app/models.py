def create_user(db, user_info):
    user = {
        'user_id': user_info['id'],
        'email': user_info['email'],
        'name': user_info.get('name', ''),
    }
    db.users.insert_one(user)
    return user

def get_user(db, user_id):
    return db.users.find_one({'user_id': user_id})
