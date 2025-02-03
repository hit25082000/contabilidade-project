import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  authState,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { toSignal } from '@angular/core/rxjs-interop';

export interface UserData {
  id: string;
  firebase_uid: string;
  tipo_usuario: 'contador' | 'cliente';
  dados_empresa?: {
    nome?: string;
    cnpj?: string;
    endereco?: string;
  };
  created_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  // Signals
  readonly currentUser = signal<User | null>(null);
  readonly userData = signal<UserData | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  constructor() {
    // Converter o observable authState para signal
    toSignal(authState(this.auth), { initialValue: null });
    
    // Observar mudanças no estado de autenticação
    authState(this.auth).subscribe(async (user) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
      
      if (user) {
        const userData = await this.getUserData(user.uid);
        this.userData.set(userData);
      } else {
        this.userData.set(null);
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      this.loadingService.show();
      const { user } = await signInWithEmailAndPassword(this.auth, email, password);
      const userData = await this.getUserData(user.uid);
      this.userData.set(userData);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(this.getErrorMessage((error as AuthError).code));
      }
      throw error;
    } finally {
      this.loadingService.hide();
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      this.loadingService.show();
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(this.auth, provider);
      
      // Verificar se é primeiro login
      const userData = await this.getUserData(user.uid);
      if (!userData) {
        await this.createUserData(user.uid, {
          id: user.uid,
          firebase_uid: user.uid,
          tipo_usuario: 'cliente', // Tipo padrão para login com Google
          created_at: new Date()
        });
      }
      
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(this.getErrorMessage((error as AuthError).code));
      }
      throw error;
    } finally {
      this.loadingService.hide();
    }
  }

  async register(email: string, password: string, tipoUsuario: 'contador' | 'cliente'): Promise<void> {
    try {
      this.loadingService.show();
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
      
      await this.createUserData(user.uid, {
        id: user.uid,
        firebase_uid: user.uid,
        tipo_usuario: tipoUsuario,
        created_at: new Date()
      });

      await this.router.navigate(['/dashboard']);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(this.getErrorMessage((error as AuthError).code));
      }
      throw error;
    } finally {
      this.loadingService.hide();
    }
  }

  async logout(): Promise<void> {
    try {
      this.loadingService.show();
      await signOut(this.auth);
      this.userData.set(null);
      await this.router.navigate(['/login']);
    } finally {
      this.loadingService.hide();
    }
  }

  private async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'usuarios', uid));
      return userDoc.exists() ? userDoc.data() as UserData : null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }

  private async createUserData(uid: string, userData: UserData): Promise<void> {
    try {
      await setDoc(doc(this.firestore, 'usuarios', uid), userData);
    } catch (error) {
      console.error('Erro ao criar dados do usuário:', error);
      throw error;
    }
  }

  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/email-already-in-use': 'E-mail já está em uso.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/operation-not-allowed': 'Operação não permitida.',
      'auth/popup-closed-by-user': 'Login com Google cancelado pelo usuário.',
    };

    return errorMessages[errorCode] || 'Ocorreu um erro durante a autenticação.';
  }
}
