import { UserRepository } from './src/repositories/user.repository';
import { connectDatabase } from './src/database/db';

async function fixUsername() {
  try {
    // Connect to DB
    await connectDatabase();

    const userRepository = new UserRepository();

    // Find the user with _id '697f5a54e5ff0316b7450301'
    const user = await userRepository.getUserById('697f5a54e5ff0316b7450301');
    if (!user) {
      console.log('User not found');
      return;
    }

    // If username is email, generate new username
    if (user.username === user.email) {
      let baseUsername = user.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      while (await userRepository.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Update the user
      await userRepository.updateUser(user._id.toString(), { username });
      console.log(`Updated username for user ${user._id} to ${username}`);
    } else {
      console.log('Username is already correct');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error fixing username:', error);
    process.exit(1);
  }
}
fixUsername();
