import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  Firestore
} from 'firebase/firestore';
import { from, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

export interface Product {
  id?: string | number;
  name: string;
  price: number;
  categoryId?: string | number;
  category_id?: string | number;
  category_name?: string;
  description?: string;
  created_at?: string;
  stock?: number;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productsCol = collection(db, 'products');
  private readonly maxPrice = 999999.99;
  private readonly maxStock = 999999;
  private readonly maxUrlLength = 500;
  private readonly maxBase64Length = 5_000_000;
  private readonly allowedImageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml'
  ];
  private readonly allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'];

  getProducts(): Observable<any[]> {
    return from(getDocs(this.productsCol)).pipe(
      map(snapshot => snapshot.docs.map(d => {
        const data = d.data() as any;
        // Exclude id from data since we use the document ID
        const { id, ...productData } = data;
        return { id: d.id, ...productData };
      }))
    );
  }

  getProductsWithCategories(): Observable<{ products: any[], categories: any[] }> {
    const categoriesCol = collection(db, 'categories');
    return from(Promise.all([
      getDocs(this.productsCol),
      getDocs(categoriesCol)
    ])).pipe(
      map(([productsSnap, categoriesSnap]) => {
        const categories = categoriesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        const categoryMap = new Map(categories.map(c => [String(c.id).toLowerCase(), c.name]));

        const products = productsSnap.docs.map(doc => {
          const data = doc.data() as any;
          // Exclude id from data since we use the document ID
          const { id, ...productData } = data;
          const product = { id: doc.id, ...productData };
          const categoryId = String(product.categoryId || product.category_id || '').toLowerCase();
          const categoryName = categoryMap.get(categoryId);
          product.category_name = categoryName || `Catégorie ${categoryId}`;
          console.log(`Product ${product.name}: categoryId=${categoryId}, found=${!!categoryName}, name=${product.category_name}`);
          return product;
        });

        return { products, categories: categories.map(c => ({ ...c, id: String(c.id) })) };
      })
    );
  }

  getProduct(id: string | number): Observable<any | null> {
    const ref = doc(db, 'products', String(id));
    return from(getDoc(ref)).pipe(map(d => {
      if (!d.exists()) return null;
      const data = d.data() as any;
      // Exclude id from data since we use the document ID
      const { id: _, ...productData } = data;
      return { id: d.id, ...productData };
    }));
  }

  createProduct(product: Product) {
    const validated = this.sanitizeAndValidateProduct(product, 'create');
    if ('error' in validated) {
      return throwError(() => new Error(validated.error));
    }
    return from(addDoc(this.productsCol, validated.payload).then(ref => ref.id));
  }

  updateProduct(id: string | number, product: Partial<Product>) {
    const validated = this.sanitizeAndValidateProduct(product, 'update');
    if ('error' in validated) {
      return throwError(() => new Error(validated.error));
    }
    const ref = doc(db, 'products', String(id));
    return from(setDoc(ref, validated.payload, { merge: true }));
  }

  deleteProduct(id: string | number) {
    const ref = doc(db, 'products', String(id));
    return from(deleteDoc(ref));
  }

  getCategories(): Observable<any[]> {
    const categoriesCol = collection(db, 'categories');
    return from(getDocs(categoriesCol)).pipe(
      map(snapshot => snapshot.docs.map(d => {
        const data = d.data() as any;
        // Exclude id from data since we use the document ID
        const { id, ...categoryData } = data;
        return { id: d.id, ...categoryData };
      }))
    );
  }

  private sanitizeAndValidateProduct(
    product: Partial<Product>,
    mode: 'create' | 'update'
  ): { payload: Partial<Product> } | { error: string } {
    const payload: Partial<Product> = {};

    const rawName = product.name;
    const rawPrice = product.price;
    const rawStock = product.stock;
    const rawDescription = product.description;
    const rawImage = product.image;
    const rawCategory = product.categoryId ?? product.category_id;

    if (rawName !== undefined || mode === 'create') {
      const name = String(rawName || '').trim();
      if (!name) return { error: 'Validation produit: le nom est obligatoire.' };
      if (name.length < 2 || name.length > 100) {
        return { error: 'Validation produit: le nom doit contenir entre 2 et 100 caractères.' };
      }
      if (!/[A-Za-z0-9À-ÖØ-öø-ÿ]/.test(name)) {
        return { error: 'Validation produit: le nom doit contenir au moins une lettre ou un chiffre.' };
      }
      payload.name = name;
    }

    if (rawPrice !== undefined || mode === 'create') {
      const price = Number(rawPrice);
      if (!Number.isFinite(price)) return { error: 'Validation produit: le prix est obligatoire.' };
      if (price < 0.01 || price > this.maxPrice) {
        return { error: 'Validation produit: le prix est hors limites autorisées.' };
      }
      const scaledPrice = price * 100;
      if (Math.abs(scaledPrice - Math.round(scaledPrice)) > 1e-6) {
        return { error: 'Validation produit: le prix ne peut pas avoir plus de 2 décimales.' };
      }
      payload.price = price;
    }

    if (rawStock !== undefined || mode === 'create') {
      const stock = Number(rawStock);
      if (!Number.isFinite(stock)) return { error: 'Validation produit: le stock est obligatoire.' };
      if (!Number.isInteger(stock) || stock < 0 || stock > this.maxStock) {
        return { error: 'Validation produit: le stock doit être un entier entre 0 et 999999.' };
      }
      payload.stock = stock;
    }

    if (rawCategory !== undefined || mode === 'create') {
      const categoryId = String(rawCategory || '').trim();
      if (!categoryId) return { error: 'Validation produit: la catégorie est obligatoire.' };
      payload.categoryId = categoryId;
    }

    if (rawDescription !== undefined || mode === 'create') {
      const description = String(rawDescription || '').trim();
      if (!description) return { error: 'Validation produit: la description est obligatoire.' };
      if (description.length < 10 || description.length > 1000) {
        return { error: 'Validation produit: la description doit contenir entre 10 et 1000 caractères.' };
      }
      payload.description = description;
    }

    if (rawImage !== undefined || mode === 'create') {
      const image = String(rawImage || '').trim();
      if (!image) return { error: 'Validation produit: l\'image est obligatoire.' };

      const base64Match = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      const isBase64Image = !!base64Match;
      const isHttpImage = /^https?:\/\/\S+$/i.test(image);
      if (!isBase64Image && !isHttpImage) {
        return { error: 'Validation produit: l\'image doit être une URL http(s) ou un fichier image encodé.' };
      }

      if (isBase64Image) {
        const mimeType = base64Match![1].toLowerCase();
        if (!this.allowedImageMimeTypes.includes(mimeType)) {
          return { error: 'Validation produit: format image importée non supporté.' };
        }
      }

      if (isHttpImage && image.length > this.maxUrlLength) {
        return { error: 'Validation produit: l\'URL image dépasse 500 caractères.' };
      }
      if (isBase64Image && image.length > this.maxBase64Length) {
        return { error: 'Validation produit: l\'image encodée est trop volumineuse.' };
      }

      if (isHttpImage) {
        try {
          const parsedUrl = new URL(image);
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return { error: 'Validation produit: le lien image doit être en http(s).' };
          }

          const pathname = parsedUrl.pathname.toLowerCase();
          const hasFileExtension = /\.[a-z0-9]+$/.test(pathname);
          const hasAllowedExtension = this.allowedImageExtensions.some(ext => pathname.endsWith(ext));
          if (hasFileExtension && !hasAllowedExtension) {
            return { error: 'Validation produit: extension d\'image non supportée.' };
          }
        } catch {
          return { error: 'Validation produit: lien image invalide.' };
        }
      }

      payload.image = image;
    }

    if (mode === 'update' && Object.keys(payload).length === 0) {
      return { error: 'Validation produit: aucune donnée valide à mettre à jour.' };
    }

    return { payload };
  }
}
